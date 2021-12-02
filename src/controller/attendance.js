var attendanceModel = require("../models/attendance");
var userModel = require("../models/user");
const { Validator } = require("node-input-validator");
var dateFormat = require("dateformat");
const config = require("../config/config");
var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: config.ses.accessKeyId,
  secretAccessKey: config.ses.secretAccessKey,
  region: config.ses.region,
});

const Attendance = function () {};

Attendance.prototype.insertAttendanceRequest = async function (data, callback) {
  const validate = new Validator(data, {
    userId: "required",
    date: "required",
    attendanceStatus: "required",
    status: "required",
    task: "required",
  });

  const validated = await validate.check();

  if (!validated) {
    callback({ status: false, error: validate.errors });
    return;
  } else {
    attendanceModel.insertAttendanceRequest(data, function (response) {
      callback(response);
    });
  }
};

Attendance.prototype.updateAttendanceRequest = async function (data, callback) {
  const validate = new Validator(data, {
    requestId: "required",
    status: "required",
  });

  const validated = await validate.check();

  if (!validated) {
    callback({ status: false, error: validate.errors });
  } else {
    attendanceModel.updateAttendanceRequest(data, function (response) {
      callback(response);
    });
  }
};

Attendance.prototype.getAttendanceRequest = async function (data, callback) {
  attendanceModel.getAttendanceRequest(data, function (response) {
    callback(response);
  });
};

Attendance.prototype.sendAttendanceMailToCustomer = async function (
  data,
  callback
) {
  let params = {
    attendanceDate: dateFormat(new Date(), config.API_DATE_FORMAT),
  };
  let userNotPresent = await userModel.getNotPresentUser(params);  
  // console.log('userNotPresent', userNotPresent);
  userModel.getUserAttendance(params, function (response) {
    if (response.status && response.data.length > 0) {
      let htmlRows = ``;
      let additionalNote = "NA";
      let notPresentHtmlRows = ``;
      if (userNotPresent.status && userNotPresent.data.length > 0) {
        console.log('in', userNotPresent);
        userNotPresent.data.map((value, index) => {
          notPresentHtmlRows =
            notPresentHtmlRows +
            `<tr>
          <td style="padding: 8px" align="center">` +
            value.name +
            `</td>
                </tr>`;
        });
      }
      response.data.map(function (value, index) {
        additionalNote =
          value.additionalNote != "" && value.additionalNote != null
            ? value.additionalNote
            : "NA";
        htmlRows =
          htmlRows +
          `<tr>
                                <td style="padding: 8px" align="center">` +
          value.name +
          `</td>
                                <td style="padding: 8px" align="center">` +
          value.statusName +
          `</td>
                                <td style="padding: 8px" align="center">` +
          value.taskForDay +
          `</td>
                                <td style="padding: 8px" align="center">` +
          additionalNote +
          `</td>
                            </tr>`;
      });
      const params = {
        Destination: {
          BccAddresses: [],
          ToAddresses: ["gmiinternal@greatmanagerinstitute.com"], // Email address/addresses that you want to send your email
        },
        Message: {
          Body: {
            Html: {
              // HTML Format of the email
              Charset: "UTF-8",
              Data:
                `<h2 align="center" style="margin: 0 auto 0 auto; width: 900px;">Task List for ` +
                dateFormat(new Date(), "dS mmmm yyyy") +
                `</h2><table width="600" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#FFFFFF" align="center" style="margin: 0 auto 0 auto;">
                            <tr>
                              <td height="10" style="font-size:10px; line-height:10px;">&nbsp;</td>
                            </tr>
                            <tr>
                              <td align="center" valign="top">
                                <table width="600" cellpadding="0" cellspacing="0" border="1" class="container">
                                  <tr>
                                    <th style="padding: 10px" align="center" valign="top">
                                      Name
                                    </th>
                                    <th style="padding: 10px" align="center" valign="top">
                                      Status
                                    </th>
                                    <th style="padding: 10px" align="center" valign="top">
                                      Task
                                    </th>
                                    <th style="padding: 10px" align="center" valign="top">
                                      Additional Notes
                                    </th>
                                  </tr>
                                  ` +
                htmlRows +
                `
                                </table>

                              </td>
                            </tr>
                            <tr>
                              <td height="10" style="font-size:10px; line-height:10px;">&nbsp;</td>
                            </tr>
                          </table><h2 align="center" style="margin: 0 auto 0 auto; width: 900px;">People who have not marked their today's attendance</h2>
                          <table width="600" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#FFFFFF" align="center" style="margin: 0 auto 0 auto;">
            <tr>
                                          <td height="10" style="font-size:10px; line-height:10px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                          <td align="center" valign="top">
                            <table width="600" cellpadding="0" cellspacing="0" border="1" class="container">                          
                          <tr>
                                      <th style="padding: 10px" align="center" valign="top">
                                        Name
                                      </th>                          
                                      </tr>` +
                notPresentHtmlRows +
                `</table>
                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px" align="center">&nbsp;<b>Note</b>: Those who have been absent can regularize their attendance from portal before today 7PM</td>
                              </tr>							
                            </table>`,
            },
            Text: {
              Charset: "UTF-8",
              Data: "Task List Working!",
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: "Task List for " + dateFormat(new Date(), "dS mmmm yyyy"),
          },
        },
        Source: "admin@greatmanagerinstitute.com",
      };
      // console.log('parama', params.Message.Body.Html);      

      var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail(params)
        .promise();
      sendPromise
        .then(function (data) {
          callback({ status: true, data: data });
        })
        .catch(function (err) {
          callback({ status: false, msg: err });
        });
    } else {
      callback({ status: false, msg: response });
    }
  });
};

module.exports = new Attendance();
