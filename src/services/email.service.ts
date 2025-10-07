import nodemailer from "nodemailer";
import config from "../config/index";
import logger from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// verify transporter in dev (non-blocking)
transporter
  .verify()
  .then(() => {
    logger.info("Email transporter ready");
  })
  .catch((err) => {
    logger.warn("Email transporter verification failed", err.message);
  });

export default {
  sendMail: async (options: nodemailer.SendMailOptions) => {
    if (!config.email.user) {
      logger.warn("Email user not configured - skipping sendMail");
      return Promise.resolve();
    }
    const opts = {
      from: config.email.user,
      ...options,
    };
    return transporter.sendMail(opts);
  },
};
