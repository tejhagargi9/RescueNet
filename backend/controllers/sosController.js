// backend/controllers/sosController.js


const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const firebaseAdmin = require('../lib/firebaseAdmin');

const MAX_VOLUNTEERS_TO_NOTIFY = 3;
const MAX_NOTIFICATION_DISTANCE_METERS = 10000; // 10km, adjust as needed

// @desc    Citizen triggers an SOS alert
// @route   POST /api/sos/trigger
// @access  Private (for Citizens)
const triggerSOS = async (req, res) => {
  const { latitude, longitude, message } = req.body;
  const citizenId = req.user?.id; // from auth middleware

  if (!citizenId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Valid latitude and longitude are required for SOS.' });
  }

  try {
    const citizen = await User.findById(citizenId);
    if (!citizen || citizen.userType !== 'citizen') {
      return res.status(403).json({ message: 'Only registered citizens can trigger SOS.' });
    }

    const citizenLocation = { type: 'Point', coordinates: [longitude, latitude] };

    let newSOSAlert = new SOSAlert({
      citizenId,
      citizenName: citizen.name,
      citizenLocation,
      message: message || '',
      status: 'Pending',
    });
    await newSOSAlert.save();

    // Find nearby volunteers
    const nearbyVolunteers = await User.find({
      userType: 'volunteer',
      fcmToken: { $ne: null, $exists: true }, // Has an FCM token
      currentLocation: {
        $near: {
          $geometry: citizenLocation,
          $maxDistance: MAX_NOTIFICATION_DISTANCE_METERS,
        },
      },
    }).limit(MAX_VOLUNTEERS_TO_NOTIFY);

    let finalVolunteersToNotify = nearbyVolunteers;

    // If no volunteers found within maxDistance, try to find the absolute closest ones
    if (nearbyVolunteers.length === 0) {
      const closestVolunteers = await User.find({
        userType: 'volunteer',
        fcmToken: { $ne: null, $exists: true },
        // No maxDistance, just find closest
      })
        .sort({ currentLocation: { $near: { $geometry: citizenLocation } } }) // This might not work directly, alternative below
        .limit(MAX_VOLUNTEERS_TO_NOTIFY); // Still limit to 3

      // A more robust way for $near without $maxDistance is to use aggregation
      // if (closestVolunteers.length === 0) {
      //  const aggregationResult = await User.aggregate([
      //    {
      //      $geoNear: {
      //         near: citizenLocation,
      //         distanceField: "dist.calculated",
      //         query: { userType: 'volunteer', fcmToken: { $ne: null, $exists: true } },
      //         spherical: true
      //      }
      //    },
      //    { $limit: MAX_VOLUNTEERS_TO_NOTIFY }
      //  ]);
      //  finalVolunteersToNotify = aggregationResult;
      // } else {
      //  finalVolunteersToNotify = closestVolunteers;
      // }
      finalVolunteersToNotify = closestVolunteers; // Use simpler approach for now
    }


    if (finalVolunteersToNotify.length === 0) {
      newSOSAlert.status = 'Unattended'; // No volunteers to notify
      await newSOSAlert.save();
      return res.status(200).json({ message: 'SOS triggered, but no volunteers available for immediate notification.', alertId: newSOSAlert._id });
    }

    const notificationPromises = [];
    const respondedVolunteersData = [];

    for (const volunteer of finalVolunteersToNotify) {
      const notificationPayload = {
        notification: {
          title: 'SOS Alert! Citizen Needs Help!',
          body: `${citizen.name} near you requires assistance. Tap for details.`,
          // icon: `${process.env.FRONTEND_URL}/RescueNetLogo.png` // if served from frontend public
        },
        webpush: {
          notification: {
            icon: `${process.env.FRONTEND_URL}/RescueNetLogo.png`, // Make sure this logo is in your frontend public folder
          },
          fcm_options: { // Use fcm_options.link for web push click_action
            link: `${process.env.FRONTEND_URL}/sos-alerts/${newSOSAlert._id}`
          }
        },
        token: volunteer.fcmToken,
      };

      notificationPromises.push(firebaseAdmin.messaging().send(notificationPayload));
      respondedVolunteersData.push({
        volunteerId: volunteer._id,
        volunteerName: volunteer.name,
        fcmToken: volunteer.fcmToken,
        responseStatus: 'Notified',
      });
    }

    try {
      await Promise.all(notificationPromises);
      newSOSAlert.respondedVolunteers = respondedVolunteersData;
      newSOSAlert.status = 'VolunteersNotified';
      await newSOSAlert.save();
      res.status(201).json({ message: 'SOS triggered and notifications sent to nearby volunteers.', alertId: newSOSAlert._id });
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Even if notifications fail for some, SOS is logged.
      newSOSAlert.respondedVolunteers = respondedVolunteersData; // Log who we attempted to notify
      newSOSAlert.status = 'NotificationFailed'; // Custom status
      await newSOSAlert.save();
      res.status(207).json({ message: 'SOS triggered, but some notifications may have failed.', alertId: newSOSAlert._id });
    }

  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({ message: 'Server error while triggering SOS.' });
  }
};

// @desc    Get SOS alerts for a logged-in volunteer
// @route   GET /api/sos/volunteer-alerts
// @access  Private (for Volunteers)
const getVolunteerSOSAlerts = async (req, res) => {
  const volunteerId = req.user?.id;

  if (!volunteerId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const alerts = await SOSAlert.find({ 'respondedVolunteers.volunteerId': volunteerId })
      .sort({ createdAt: -1 }); // Newest first
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching volunteer SOS alerts:', error);
    res.status(500).json({ message: 'Server error while fetching alerts.' });
  }
};

// @desc    Volunteer updates their response status for an SOS alert
// @route   PUT /api/sos/alerts/:alertId/response
// @access  Private (for Volunteers)
const updateSOSAlertResponse = async (req, res) => {
  const { alertId } = req.params;
  const { responseStatus } = req.body; // e.g., 'Acknowledged', 'EnRoute', etc.
  const volunteerId = req.user?.id;

  if (!volunteerId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!responseStatus) {
    return res.status(400).json({ message: 'Response status is required.' });
  }
  const validStatuses = ['Acknowledged', 'EnRoute', 'Assisting', 'UnableToAssist', 'ResolvedByVolunteer'];
  if (!validStatuses.includes(responseStatus)) {
    return res.status(400).json({ message: 'Invalid response status.' });
  }

  try {
    const alert = await SOSAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'SOS Alert not found.' });
    }

    const volunteerEntry = alert.respondedVolunteers.find(
      v => v.volunteerId.toString() === volunteerId.toString()
    );

    if (!volunteerEntry) {
      return res.status(403).json({ message: 'Volunteer not associated with this alert or unauthorized.' });
    }

    volunteerEntry.responseStatus = responseStatus;
    volunteerEntry.responseTimestamp = new Date();

    // Optionally update overall alert status based on volunteer's response
    if (responseStatus === 'EnRoute' && alert.status !== 'AssistanceInProgress') {
      alert.status = 'AssistanceEnRoute';
    } else if (responseStatus === 'Assisting') {
      alert.status = 'AssistanceInProgress';
    } else if (responseStatus === 'ResolvedByVolunteer') {
      // Check if other volunteers are still 'Assisting' or 'EnRoute'
      const otherActive = alert.respondedVolunteers.some(
        v => v.volunteerId.toString() !== volunteerId.toString() && ['EnRoute', 'Assisting'].includes(v.responseStatus)
      );
      if (!otherActive) {
        alert.status = 'Resolved';
      }
    }


    await alert.save();
    res.status(200).json({ message: 'SOS alert response updated successfully.', alert });
  } catch (error) {
    console.error('Error updating SOS alert response:', error);
    res.status(500).json({ message: 'Server error while updating alert response.' });
  }
};

module.exports = { triggerSOS, getVolunteerSOSAlerts, updateSOSAlertResponse };