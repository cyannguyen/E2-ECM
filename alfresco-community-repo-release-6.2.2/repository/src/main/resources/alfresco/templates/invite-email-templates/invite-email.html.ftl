<html>
   <#assign inviterPersonRef=args["inviterPersonRef"]/>
   <#assign inviterPerson=companyhome.nodeByReference[inviterPersonRef]/>
   <#assign inviteePersonRef=args["inviteePersonRef"]/>
   <#assign inviteePerson=companyhome.nodeByReference[inviteePersonRef]/>

   <head>
      <style type="text/css"><!--
      body
      {
         font-family: Arial, sans-serif;
         font-size: 14px;
         color: #4c4c4c;
      }
      
      a, a:visited
      {
         color: #0072cf;
      }
      --></style>
   </head>
   
   <body bgcolor="#dddddd">
      <table width="100%" cellpadding="20" cellspacing="0" border="0" bgcolor="#dddddd">
         <tr>
            <td width="100%" align="center">
               <table width="70%" cellpadding="0" cellspacing="0" bgcolor="white" style="background-color: white; border: 1px solid #aaaaaa;">
                  <tr>
                     <td width="100%">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                           <tr>
                              <td style="padding: 10px 30px 0px;">
                                 <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                       <td>
                                          <table cellpadding="0" cellspacing="0" border="0">
                                             <tr>
                                                <td>
                                                   <img src="${shareUrl}/res/components/site-finder/images/site-64.png" alt="" width="64" height="64" border="0" style="padding-right: 20px;" />
                                                </td>
                                                <td>
                                                   <div style="font-size: 22px; padding-bottom: 4px;">
                                                      You have been invited to join the '${args["siteName"]?html}' site
                                                   </div>
                                                   <div style="font-size: 13px;">
                                                      ${date?datetime?string.full}
                                                   </div>
                                                </td>
                                             </tr>
                                          </table>
                                          <div style="font-size: 14px; margin: 12px 0px 24px 0px; padding-top: 10px; border-top: 1px solid #aaaaaa;">
                                             <p>Hi ${inviteePerson.properties["cm:firstName"]?html!""},</p>
      
                                             <p>${inviterPerson.properties["cm:firstName"]?html!""} ${inviterPerson.properties["cm:lastName"]?html!""} 
                                             has invited you to join the <b>${args["siteName"]?html}</b> site with the role of ${args["inviteeSiteRole"]}.</p>
                                             
                                             <p>Click this link to accept ${inviterPerson.properties["cm:firstName"]?html!""}'s invitation:<br />
                                             <br /><a href="${args["acceptLink"]}">${args["acceptLink"]}</a></p>
                                             
                                             <#if args["inviteeGenPassword"]?exists>
                                             <p>An account has been created for you and your login details are:<br />
                                             <br />Username: <b>${args["inviteeUserName"]?html}</b>
                                             <br />Password: <b>${args["inviteeGenPassword"]?html}</b>
                                             </p>
                                             
                                             <p><b>We strongly advise you to change your password when you log in for the first time.</b><br />
                                             You can do this by going to <b>My Profile</b> and selecting <b>Change Password</b>.</p>
                                             </#if>
                                             
                                             <p>If you want to decline ${inviterPerson.properties["cm:firstName"]?html!""}???s invitation, click this link:<br />
                                             <br /><a href="${args["rejectLink"]}">${args["rejectLink"]}</a></p>
                                             
                                          </div>
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                           </tr>
                           
                           <tr>
                              <td>
                                 <div style="border-bottom: 1px solid #aaaaaa;">&nbsp;</div>
                              </td>
                           </tr>
                           <tr>
                              <td style="padding: 10px 30px;">
                                 <img src="${shareUrl}/res/components/images/logo-footer.png" alt="" width="127" height="28" border="0" />
                              </td>
                           </tr>
                        </table>
                     </td>
                  </tr>
               </table>
            </td>
         </tr>
      </table>
   </body>
</html>