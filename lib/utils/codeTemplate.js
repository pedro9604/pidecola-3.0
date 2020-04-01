exports.template = (code, name) => {
  return `
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0;">
        <meta name="format-detection" content="telephone=no"/>

        <!-- Responsive Mobile-First Email Template by Konstantin Savchenko, 2015.
        https://github.com/konsav/email-templates/  -->

        <style>
      /* Reset styles */ 
      body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important;}
      body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
      img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
      #outlook a { padding: 0; }
      .ReadMsgBody { width: 100%; } .ExternalClass { width: 100%; }
      .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }

      /* Extra floater space for advanced mail clients only */ 
      @media all and (max-width: 600px) {
        .floater { width: 320px; }
      }

      /* Set color for auto links (addresses, dates, etc.) */ 
      a, a:hover {
        color: #127DB3;
      }
      .footer a, .footer a:hover {
        color: #999999;
      }

        </style>

        <!-- MESSAGE SUBJECT -->
        <title>Get this responsive email template</title>

      </head>

      <!-- BODY -->
      <!-- Set message background color (twice) and text color (twice) -->
      <body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
        background-color: #FFFFFF;
        color: #000000;"
        bgcolor="#FFFFFF"
        text="#000000">

      <!-- SECTION / BACKGROUND -->
      <!-- Set section background color -->
      <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background"><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;"
        bgcolor="#127DB3">

      <!-- WRAPPER -->
      <!-- Set wrapper width (twice) -->
      <table border="0" cellpadding="0" cellspacing="0" align="center"
        width="600" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
        max-width: 600px;" class="wrapper">

        <!-- HEADER -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
        <tr>
          <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; line-height: 130%;
            padding-top: 20px;
            color: #FFFFFF;
            font-family: sans-serif;" class="header">
              Bienvenido a <b><span style="color: #ffd302;">Pide</span> <span style="color: #1e2172;">Cola</span> USB 3.0<b/>
          </td>
        </tr>

        <!-- SUBHEADER -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
        <tr>
          <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-bottom: 3px; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 18px; font-weight: 300; line-height: 150%;
            padding-top: 5px;
            color: #FFFFFF;
            font-family: sans-serif;" class="subheader">
              Gracias por registrarte ${name}, Para completar tu registro debes ingresar el codigo suministrado en este correo.
          </td>
        </tr>
        <!-- PARAGRAPH -->
        <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
        <tr>
          <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
            padding-top: 25px; 
            color: #FFFFFF;
            font-family: sans-serif;" class="paragraph">
              Tu codigo de seguridad es el siguiente: ${code}
          </td>
        </tr>
        <tr>
        <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
          padding-top: 25px; 
          color: #FFFFFF;
          font-family: sans-serif;" class="paragraph">
            Si no realizaste ningun registro comunicate con la FCEUSB o ignora este mensaje.
        </td>
      </tr>

      <!-- End of WRAPPER -->
      </table></table> </body>
  `
}

function offerTemplate (name) {
  return `
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0;">
        <meta name="format-detection" content="telephone=no"/>

        <!-- Responsive Mobile-First Email Template by Konstantin Savchenko, 2015.
        https://github.com/konsav/email-templates/  -->

        <style>
        /* Reset styles */ 
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important;}
        body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        #outlook a { padding: 0; }
        .ReadMsgBody { width: 100%; } .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }

        /* Extra floater space for advanced mail clients only */ 
        @media all and (max-width: 600px) {
          .floater { width: 320px; }
        }

        /* Set color for auto links (addresses, dates, etc.) */ 
        a, a:hover {
          color: #127DB3;
        }
        .footer a, .footer a:hover {
          color: #999999;
        }

          </style>

          <!-- MESSAGE SUBJECT -->
          <title>Tienes una oferta de cola</title>

      </head>

      <!-- BODY -->
      <!-- Set message background color (twice) and text color (twice) -->
      <body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
        background-color: #FFFFFF;
        color: #000000;"
        bgcolor="#FFFFFF"
        text="#000000">

        <!-- SECTION / BACKGROUND -->
        <!-- Set section background color -->
        <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background"><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;"
          bgcolor="#127DB3">

          <!-- WRAPPER -->
          <!-- Set wrapper width (twice) -->
          <table border="0" cellpadding="0" cellspacing="0" align="center"
            width="600" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
            max-width: 600px;" class="wrapper">

            <!-- HEADER -->
            <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
            <tr>
              <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; line-height: 130%;
                padding-top: 20px;
                color: #FFFFFF;
                font-family: sans-serif;" class="header">
                  Bienvenido a <b><span style="color: #ffd302;">Pide</span> <span style="color: #1e2172;">Cola</span> USB 3.0<b/>
              </td>
            </tr>

            <!-- SUBHEADER -->
            <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
            <tr>
              <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-bottom: 3px; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 18px; font-weight: 300; line-height: 150%;
                padding-top: 5px;
                color: #FFFFFF;
                font-family: sans-serif;" class="subheader">
                  Gracias por utilizar nuestra aplicación ${name}. 
              </td>
            </tr>
            <!-- PARAGRAPH -->
            <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
            <tr>
              <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
                padding-top: 25px; 
                color: #FFFFFF;
                font-family: sans-serif;" class="paragraph">
                  Tienes una oferta de cola pendiente.
              </td>
            </tr>
            <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
              padding-top: 25px; 
              color: #FFFFFF;
              font-family: sans-serif;" class="paragraph">
                Te invitamos a revisar la aplicación para que la consideres.
            </td>
            </tr>

            <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
              padding-top: 25px; 
              color: #FFFFFF;
              font-family: sans-serif;" class="paragraph">
                Ten un buen día.
            </td>
            </tr>
          <!-- End of WRAPPER -->
          </table>
        </table>
      </body>`
}

function responseTemplate (name) {
  return `
  <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0;">
        <meta name="format-detection" content="telephone=no"/>

        <!-- Responsive Mobile-First Email Template by Konstantin Savchenko, 2015.
        https://github.com/konsav/email-templates/  -->

        <style>
        /* Reset styles */ 
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important;}
        body, table, td, div, p, a { -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; border-spacing: 0; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        #outlook a { padding: 0; }
        .ReadMsgBody { width: 100%; } .ExternalClass { width: 100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }

        /* Extra floater space for advanced mail clients only */ 
        @media all and (max-width: 600px) {
          .floater { width: 320px; }
        }

        /* Set color for auto links (addresses, dates, etc.) */ 
        a, a:hover {
          color: #127DB3;
        }
        .footer a, .footer a:hover {
          color: #999999;
        }

          </style>

          <!-- MESSAGE SUBJECT -->
          <title>Han respondido a tu oferta</title>

      </head>

      <!-- BODY -->
      <!-- Set message background color (twice) and text color (twice) -->
      <body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
        background-color: #FFFFFF;
        color: #000000;"
        bgcolor="#FFFFFF"
        text="#000000">

        <!-- SECTION / BACKGROUND -->
        <!-- Set section background color -->
        <table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background"><tr><td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;"
          bgcolor="#127DB3">

          <!-- WRAPPER -->
          <!-- Set wrapper width (twice) -->
          <table border="0" cellpadding="0" cellspacing="0" align="center"
            width="600" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;
            max-width: 600px;" class="wrapper">

            <!-- HEADER -->
            <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
            <tr>
              <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; line-height: 130%;
                padding-top: 20px;
                color: #FFFFFF;
                font-family: sans-serif;" class="header">
                  Bienvenido a <b><span style="color: #ffd302;">Pide</span> <span style="color: #1e2172;">Cola</span> USB 3.0<b/>
              </td>
            </tr>

            <!-- SUBHEADER -->
            <!-- Set text color and font family ("sans-serif" or "Georgia, serif") -->
            <tr>
              <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-bottom: 3px; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 18px; font-weight: 300; line-height: 150%;
                padding-top: 5px;
                color: #FFFFFF;
                font-family: sans-serif;" class="subheader">
                  Gracias por utilizar nuestra aplicación ${name}. 
              </td>
            </tr>
            <!-- PARAGRAPH -->
            <!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
            <tr>
              <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
                padding-top: 25px; 
                color: #FFFFFF;
                font-family: sans-serif;" class="paragraph">
                  Han respondido a tu oferta de cola.
              </td>
            </tr>
            <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
              padding-top: 25px; 
              color: #FFFFFF;
              font-family: sans-serif;" class="paragraph">
                Te invitamos a revisar la aplicación para que tengas más información.
            </td>
            </tr>

            <tr>
            <td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
              padding-top: 25px; 
              color: #FFFFFF;
              font-family: sans-serif;" class="paragraph">
                Ten un buen día.
            </td>
            </tr>
          <!-- End of WRAPPER -->
          </table>
        </table>
      </body>
    `
}

module.exports.offerTemplate = offerTemplate
module.exports.responseTemplate = responseTemplate
