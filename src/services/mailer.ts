import hbs from 'nodemailer-express-handlebars'
import nodemailer from 'nodemailer'
import path from 'path'
import {EMAIL_USER, EMAIL_PASS} from '../utils/constants'

const mailer = async (user: any) => {
    // initialize nodemailer
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth:{
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        }
    )

    // point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('././src/utils/emailTemplates/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('././src/utils/emailTemplates/'),
    };

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))

    if (user.email) {
        const mailOptions = {
            from: '"Veciapp" <julianchos.rivera@gmail.com>', // sender address
            template: user.template,
            to: user.email,
            subject: `Bienvenido a Veciapp, ${user.fullname}`,
            context: {
                fullname: user.fullname,
                state: user.state,
                title: user.title,
                message: user.message,
                anchor: user.anchor
            },
        }
        try {
            await transporter.sendMail(mailOptions)
        } catch (error) {
            console.log(`Ocurrió un error enviando el email a ${user.email}`, error)
        }
    }
}

export default mailer;
