import nodemailer from 'nodemailer'
import { create } from 'express-handlebars'
import fs from 'fs'
import path from 'path'
import { EMAIL_USER, EMAIL_PASS } from '../utils/constants'

// Utilidad para compilar templates
const compileTemplate = async (templateName: string, context: any) => {
    const hbs = create()
    const templatePath = path.join(__dirname, '../utils/emailTemplates', `${templateName}.handlebars`)
    const templateContent = fs.readFileSync(templatePath, 'utf8')
    const compiled = hbs.handlebars.compile(templateContent)
    return compiled(context)
}

const mailer = async (user: any) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    })

    if (user.email) {
        const html = await compileTemplate(user.template, {
            fullname: user.fullname,
            state: user.state,
            title: user.title,
            message: user.message,
            anchor: user.anchor,
        })

        const mailOptions = {
            from: '"Veciapp" <julianchos.rivera@gmail.com>',
            to: user.email,
            subject: `Bienvenido a Veciapp, ${user.fullname}`,
            html, // Aquí va el contenido compilado
        }

        try {
            await transporter.sendMail(mailOptions)
        } catch (error) {
            console.log(`Ocurrió un error enviando el email a ${user.email}`, error)
        }
    }
}

export default mailer

// import hbs from 'nodemailer-express-handlebars'
// import nodemailer from 'nodemailer'
// import path from 'path'
// import {EMAIL_USER, EMAIL_PASS} from '../utils/constants'
//
// const mailer = async (user: any) => {
//     // initialize nodemailer
//     var transporter = nodemailer.createTransport(
//         {
//             service: 'gmail',
//             auth:{
//                 user: EMAIL_USER,
//                 pass: EMAIL_PASS
//             }
//         }
//     )
//
//     // point to the template folder
//     const handlebarOptions = {
//         viewEngine: {
//             partialsDir: path.resolve('././src/utils/emailTemplates/'),
//             defaultLayout: false,
//         },
//         viewPath: path.resolve('././src/utils/emailTemplates/'),
//     };
//
//     // use a template file with nodemailer
//     transporter.use('compile', hbs(handlebarOptions))
//
//     if (user.email) {
//         const mailOptions = {
//             from: '"Veciapp" <julianchos.rivera@gmail.com>', // sender address
//             template: user.template,
//             to: user.email,
//             subject: `Bienvenido a Veciapp, ${user.fullname}`,
//             context: {
//                 fullname: user.fullname,
//                 state: user.state,
//                 title: user.title,
//                 message: user.message,
//                 anchor: user.anchor
//             },
//         }
//         try {
//             await transporter.sendMail(mailOptions)
//         } catch (error) {
//             console.log(`Ocurrió un error enviando el email a ${user.email}`, error)
//         }
//     }
// }
//
// export default mailer;
