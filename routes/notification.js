import Expo from 'expo-server-sdk';

// Create a new Expo SDK client
let expo = new Expo();
const express = require('express');
const router = express.Router();
const path = require('path');
var passport = require('passport')
var connection  = require('../config/db');
var bcrypt = require('bcrypt');
import multer from 'multer';

let messages = [];
let chunks = expo.chunkPushNotifications(messages);

router.post("/login",function(req,res,next){

    console.log(req.body.token.value);

    pushToken = req.body.token.value;

    messages.push({
        to: pushToken,
        sound: 'default',
        body: 'This is a test notification',
        data: { withSome: 'data' },
      });

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];

      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
          } catch (error) {
            console.error(error);
          }
        }
      })();

      let receiptIds = [];
        for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
        // Like sending notifications, there are different strategies you could use
        // to retrieve batches of receipts from the Expo service.
        for (let chunk of receiptIdChunks) {
            try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);

            // The receipts specify whether Apple or Google successfully received the
            // notification and information about an error, if one occurred.
            for (let receipt of receipts) {
                if (receipt.status === 'ok') {
                continue;
                } else if (receipt.status === 'error') {
                console.error(`There was an error sending a notification: ${receipt.message}`);
                if (receipt.details && receipt.details.error) {
                    // The error codes are listed in the Expo documentation:
                    // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                    // You must handle the errors appropriately.
                    console.error(`The error code is ${receipt.details.error}`);
                }
                }
            }
            } catch (error) {
            console.error(error);
            }
        }
        })();

})



module.exports = router;