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
            title: user.title,
            message: user.message,
            anchor: user.anchor,
            // OTP Digits
            otpdigit1: user.otpdigit1,
            otpdigit2: user.otpdigit2,
            otpdigit3: user.otpdigit3,
            otpdigit4: user.otpdigit4,
            otpdigit5: user.otpdigit5,
            otpdigit6: user.otpdigit6,
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