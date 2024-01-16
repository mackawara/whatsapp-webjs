const contactModel = require('../../models/contactsModel');
const GroupsModel = require('../../models/groups');

const qrcode = require('qrcode-terminal');
const logger = require('../../services/winston');
const clientOn = async (client, arg1, arg2) => {
  const me = process.env.ME;

  if (arg1 == 'auth_failure') {
    client.on('auth_failure', msg => {
      // Fired if session restore was unsuccessful
      logger.error('AUTHENTICATION FAILURE', msg);
    });
  }
  if (arg1 == 'authenticated') {
    client.on('authenticated', async session => {
      logger.info(`client authenticated`);
    });
  }
  if (arg1 == 'ready') {
    client.on('ready', async session => {
      logger.info(`client ready`);
      client.sendMessage(process.env.ME, 'successful deploy');
    });
  }

  if (arg1 == 'qr') {
    client.on('qr', qr => {
      qrcode.generate(qr, { small: true });
      logger.info(qr);
    });
  }

  let groupName, grpDescription;
  if (arg1 == 'message') {
    client.on(`message`, async msg => {
      const chat = await msg.getChat();
      const contact = await msg.getContact();

      if (chat.isGroup) {
        logger.silly('gropu message');

        const savedGroup = await GroupsModel.findOne({
          serialisedNumber: chat.id._serialized,
        });
        logger.info(savedGroup);
        if (!savedGroup) {
          logger.silly('not saved');
          const newGroup = new GroupsModel({
            serialisedNumber: chat.id._serialized,
            notifyName: chat.name,
            number: chat.id.user,
            group: chat.name,
            date: new Date().toISOString().slice(0, 10),
          });
          try {
            newGroup.save().then(result => {
              logger.info(result);
            });
          } catch (err) {
            logger.error(err.data);
          }
        }
        /* msgBody.split(' ').forEach(word => {
            if (keywords.businessKeywords.includes(word)) {
              client.sendMessage(
                me,
                `Business keyword alert:\n ${msg.body} from Group ${chat.name} from ${msg.author}`
              );
            }
          }); */
        //grpOwner = chat.owner.user;
      }

      // logger.info(msg.body,groupName,contact);
      //grpOwner = chat.owner.user;
      else {
        let from = msg.from;

        let senderNotifyName = await contact.pushname;

        if (!contactModel.find({ number: from })) {
          const newContact = new contactModel({
            notifyName: senderNotifyName,
            number: from,
            serialisedNumber: contact.id._serialised,
            isBlocked: contact.isBlocked,
          });
          newContact.save().then(() => logger.info(' new group saved'));
        }

        chat.sendSeen();
        // msg.reply("hi thank you");
      }
    });
  }
  //run when group is left
  else if (arg1 == 'group-leave') {
    client.on('group_leave', notification => {
      logger.silly(notification);
      // User has left or been kicked from the group.

      /* client.sendMessage(
        user,
        `We are sorry to see you leave our group , May you indly share wy you decided to leave`
      ); */
      client.sendMessage(
        me,
        `User ${notification.id.participant} just left  the group`
      );
    });
  } else if (arg1 == 'group-join') {
    client.on('group_join', notification => {
      logger.info(notification);
      // User has joined or been added to the group.
      logger.info('join', notification);
      /*  client.sendMessage(
        notification.id.participant,
        "welcome to ... Here are the group rules for your convenience.... \n"
      ) */
      // notification.reply("User joined.");
    });
  } else if (arg1 == 'before' && arg2 == 'after') {
    client.on('message_revoke_everyone', async (after, before) => {
      logger.info(after); // message after it was deleted.
      if (before) {
        logger.info(before); // message before it was deleted.
      } else {
        client.sendMessage(me, `this message was deleted${before.body}`);
      }
    });
  }
};

module.exports = clientOn;
