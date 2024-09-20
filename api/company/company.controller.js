const {
    createCompany,
    getCompany,
    updateCompany,
} = require("./company.service");


const {hashSync, genSaltSync, compareSync} = require("bcrypt");
const AppError = require("../../util/appError");
const catchAsync = require("../../util/catchAsync");
const EmailService = require("../../util/sendEmail");

module.exports = {
    createCompany: catchAsync(async (req, res, next) => {
        const body = req.body;
        const salt = genSaltSync(10);


        const randPassword = new Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(x => (function (chars) {
            let umax = Math.pow(2, 32), r = new Uint32Array(1), max = umax - (umax % chars.length);
            do {
                crypto.getRandomValues(r);
            } while (r[0] > max);
            return chars[r[0] % chars.length];
        })(x)).join('');

        body.company_password = hashSync(randPassword, salt);


        body.module = JSON.parse(body.module ?? '[]');
        body.company_logo = req.file.filename

        const emailService = new EmailService();

        let teamStatement = "Team Management"

        if(body.module.length > 0){
            teamStatement = "";
            for(let i = 0; i <= body.module.length - 1; i++){

                if(i === body.module.length - 1){
                    teamStatement += body.module[i]["module_name"];
                }else if(i === body.module.length - 2){
                    teamStatement += body.module[i]["module_name"] + " and ";
                }else{
                    teamStatement += body.module[i]["module_name"] + ", ";
                }

            }
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: body.company_email,
            subject: 'OTP - QTASK',
            html: `<div style="font-family:Courier New; border-style:solid; border-width:thin;border-color:#F07D3D;padding: 25px 50px;line-height: 1.5;border-radius: 5px;"> <p style="font-size:18px">
         <h1 style="color: #F07D3D;font-size:55px">QTask</h1>
         <br></br>Dear ${body.company_name} welcome aboard!
         <br></br>Unlock effortless ${teamStatement} with QTask. Use code <b style="border-style:solid; border-width:thin;border-color:#F07D3D;padding: 4px 8px; border-radius: 10px; background-color: rgba(240,125,61,0.56);color: #000000">${randPassword}</b> to set your secure password.
         <br></br>Alternatively, you can directly change your password.
         <br></br><a href="https://www.google.com/" style="background-color: #F07D3D; border: none; color: white; padding: 5px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px; cursor: pointer;">
         Change Password
         </a>
         <br></br>We're thrilled to have you on board!
         <br></br> QTask Team.</p>
         </div>`
        };

        await emailService.sendEmail(mailOptions);

        const result = await createCompany(body);
        return res.json({
            success: 1,
            message: "Company created Successfully!",
            insertId: result["results"]["insertId"],
            data: result
        });
    }),
    getCompany : catchAsync(async (req, res, next) => {

        const data = [];

       await getCompany().then((results) =>{
           results.forEach(row => {
               const company = data.find(c => c.company_id === row.company_id);

               const module = {company_module_id: row.company_module_id, module_id: row.module_id, module_status: row.module_status, company_module_create_date: row.company_module_create_date, company_module_subscription: row.company_module_subscription, module_name: row.module_name, module_create_date: row.module_create_date};

               if (company){
                   company.module.push(module);
               }else{
                   data.push({
                       company_id: row.company_id,
                       company_name: row.company_name,
                       company_warehouse_url: row.company_warehouse_url,
                       company_warehouse_token: row.company_warehouse_token,
                       company_logo: row.company_logo,
                       company_create_date: row.company_create_date,
                       company_email: row.company_email,
                       company_contact: row.company_contact,
                       company_code: row.company_code,
                       company_created_by: row.company_created_by,
                       module: [module], // Initial role as map
                   });
               }

           });
       });
        return res.json({
            success: 1,
            message: "Requested Successfully!",
            data: data
        });
    }),
    updateCompany : catchAsync(async (req, res, next) => {
        const body = req.body;

        const result = await updateCompany(body);
        return res.json({
            success: 1,
            message: "Company updated Successfully!",
            data: result
        });
    }),
}