
define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "alfresco/core/CoreXhr",
        "alfresco/core/ObjectProcessingMixin",
        "alfresco/core/NotificationUtils",
        "alfresco/core/ObjectTypeUtils",
        "alfresco/core/topics",
        "alfresco/core/WidgetsOverrideMixin",
        "alfresco/enums/urlTypes",
        "dojo/_base/array",
        "dojo/_base/lang",
        "alfresco/buttons/AlfButton",
        "service/constants/Default"],
        function(declare, BaseService, CoreXhr, ObjectProcessingMixin, NotificationUtils, ObjectTypeUtils, topics, 
                 WidgetsOverrideMixin, urlTypes, array, lang, AlfButton, AlfConstants) {

   return declare([BaseService, CoreXhr, ObjectProcessingMixin, NotificationUtils, WidgetsOverrideMixin], {

     
      i18nRequirements: [{i18nFile: "./i18n/SiteService.properties"}],

     
      additionalSitePresets: null,

     
      createSiteDialogHeight: "500px",

    
      createSiteDialogWidth: "670px",

     
      setCreateSiteDialogValueTopic: null,

     
      setEditSiteDialogValueTopic: null,

     
      legacyMode: true,

      sitePresets: null,

      
      sitePresetsToRemove: null,

     
      userHomePage: "/dashboard",

      siteHomePage: "/dashboard",

      
      initService: function alfresco_services_SiteService__initService() {
         this.inherited(arguments);
         if (!this.sitePresets)
         {
            this.sitePresets = [
               { label: "create-site.dialog.type.collaboration", value: "site-dashboard" }
            ];
         }

         if (this.additionalSitePresets && 
             ObjectTypeUtils.isArray(this.additionalSitePresets) && 
             this.additionalSitePresets.length)
         {
            this.sitePresets = this.sitePresets.concat(this.additionalSitePresets);
         }

         if (this.sitePresetsToRemove && this.sitePresetsToRemove.length)
         {
            this.sitePresets = array.filter(this.sitePresets, function(preset) {
               return !array.some(this.sitePresetsToRemove, function(presetToRemove) {
                  return preset.value === presetToRemove;
               });
            }, this);
         }

         this.applyWidgetOverrides(this.widgetsForCreateSiteDialog, this.widgetsForCreateSiteDialogOverrides);
         this.applyWidgetOverrides(this.widgetsForEditSiteDialog, this.widgetsForEditSiteDialogOverrides);
      },

     
      registerSubscriptions: function alfresco_services_SiteService__registerSubscriptions() {
         this.alfSubscribe(topics.GET_SITES, lang.hitch(this, this.getSites));
         this.alfSubscribe("ALF_GET_SITES_ADMIN", lang.hitch(this, this.getAdminSites));
         this.alfSubscribe("ALF_GET_SITE_MEMBERSHIPS", lang.hitch(this, this.getSiteMemberships));
         this.alfSubscribe("ALF_GET_SITE_DETAILS", lang.hitch(this, this.getSiteDetails));
         this.alfSubscribe("ALF_UPDATE_SITE_DETAILS", lang.hitch(this, this.updateSite));
         this.alfSubscribe(topics.BECOME_SITE_MANAGER, lang.hitch(this, this.becomeSiteManager));
         this.alfSubscribe("ALF_JOIN_SITE", lang.hitch(this, this.joinSite));
         this.alfSubscribe("ALF_REQUEST_SITE_MEMBERSHIP", lang.hitch(this, this.requestSiteMembership));
         this.alfSubscribe("ALF_LEAVE_SITE", lang.hitch(this, this.leaveSiteRequest));
         this.alfSubscribe("ALF_LEAVE_SITE_CONFIRMATION", lang.hitch(this, this.leaveSite));
         this.alfSubscribe(topics.CREATE_SITE, lang.hitch(this, this.createSite));
         this.alfSubscribe(topics.SITE_CREATION_REQUEST, lang.hitch(this, this.onCreateSiteData));
         this.alfSubscribe(topics.EDIT_SITE, lang.hitch(this, this.editSite));
         this.alfSubscribe(topics.SITE_EDIT_REQUEST, lang.hitch(this, this.editEditSiteData));
         this.alfSubscribe(topics.DELETE_SITE, lang.hitch(this, this.onActionDeleteSite));
         this.alfSubscribe(topics.ADD_FAVOURITE_SITE, lang.hitch(this, this.addSiteAsFavourite));
         this.alfSubscribe("ALF_REMOVE_FAVOURITE_SITE", lang.hitch(this, this.removeSiteFromFavourites));
         this.alfSubscribe(topics.GET_RECENT_SITES, lang.hitch(this, this.getRecentSites));
         this.alfSubscribe(topics.GET_FAVOURITE_SITES, lang.hitch(this, this.getFavouriteSites));
         this.alfSubscribe(topics.CANCEL_JOIN_SITE_REQUEST, lang.hitch(this, this.cancelJoinSiteRequest));
         this.alfSubscribe(topics.GET_USER_SITES, lang.hitch(this, this.getUserSites));
         this.alfSubscribe(topics.ENABLE_SITE_ACTIVITY_FEED, lang.hitch(this, this.enableSiteActivityFeed));
         this.alfSubscribe(topics.DISABLE_SITE_ACTIVITY_FEED, lang.hitch(this, this.disableSiteActivityFeed));
         this.alfSubscribe(topics.VALIDATE_SITE_IDENTIFIER, lang.hitch(this, this.validateSiteIdentifier));
      },

      
      enableSiteActivityFeed: function alfresco_services_SiteService__enableSiteActivityFeed(payload) {
         if (payload.siteId)
         {
            var config = {
               url: AlfConstants.PROXY_URI + "api/activities/feed/control?s=" + payload.siteId,
               method: "DELETE"
            };
            this.mergeTopicsIntoXhrPayload(payload, config);
            this.serviceXhr(config);
         }
         else
         {
            this.alfLog("warn", "A request was made to enable the activity feed for a site, but no 'siteId' attribute was provided", payload, this);
         }
      },

      
      disableSiteActivityFeed: function alfresco_services_SiteService__disableSiteActivityFeed(payload) {
         if (payload.siteId)
         {
            var config = {
               url: AlfConstants.PROXY_URI + "api/activities/feed/control",
               method: "POST",
               data: {
                  siteId: payload.siteId
               }
            };
            this.mergeTopicsIntoXhrPayload(payload, config);
            this.serviceXhr(config);
         }
         else
         {
            this.alfLog("warn", "A request was made to disable the activity feed for a site, but no 'siteId' attribute was provided", payload, this);
         }
      },

      
      getSites: function alfresco_services_SiteService__getSites(payload) {
         // TODO: Clean this up. Choose on or other as the Aikau standard.
         var alfResponseTopic = payload.alfResponseTopic || payload.responseTopic;
         var config = {
            url: AlfConstants.PROXY_URI + "api/sites",
            method: "GET",
            alfTopic: alfResponseTopic
         };
         this.serviceXhr(config);
      },

     
      getUserSites: function alfresco_services_SiteService__getSites(payload) {
         if (payload.userName)
         {
            var config = {
               url: AlfConstants.PROXY_URI + "api/people/admin/sites",
               method: "GET",
               successCallback: this.onUserSitesSuccess,
               failureCallback: this.onUserSitesFailure,
               callbackScope: this
            };
            this.mergeTopicsIntoXhrPayload(payload, config);
            this.serviceXhr(config);
         }
         else
         {
            this.alfLog("warn", "A request was made to get the sites for a user but no 'userName' attribute was provided", payload, this);
         }
      },

      
      onUserSitesSuccess: function alfresco_services_SiteService__onUserSitesSuccess(response, originalRequestConfig) {
         var url = AlfConstants.PROXY_URI + "api/activities/feed/controls";
         var config = {
            url: url,
            sitesData: response,
            initialRequestConfig: originalRequestConfig,
            method: "GET",
            successCallback: this.publishSites,
            callbackScope: this
         };
         this.serviceXhr(config);
      },

      
      publishSites: function alfresco_services_SiteService__publishSites(response, originalRequestConfig) {
         var sites = originalRequestConfig.sitesData;
         
         // Update the site data with the activity feed control data...
         sites = array.map(sites, function(site) {
            site.activityFeedEnabled = true;
            if (site.shortName)
            {
               site.activityFeedEnabled = !array.some(response, function(feedControl) {
                  return feedControl.siteId === site.shortName;
               });
               return site;
            }
         }, this);

         var topic = lang.getObject("initialRequestConfig.alfSuccessTopic", false, originalRequestConfig);
         if (!topic)
         {
            topic = lang.getObject("initialRequestConfig.alfResponseTopic", false, originalRequestConfig);
         }
         if (topic)
         {
            this.alfPublish(topic, {
               items: sites
            });
         }
      },

      
      onUserSitesFailure: function alfresco_services_UserService__onUserSitesFailure(response, originalRequestConfig) {
         this.alfLog("error", "It was not possible to retrieve the sites for a user", response, originalRequestConfig, this);
      },

      
      getAdminSites: function alfresco_services_SiteService__getAdminSites(payload) {
         // skipCount is the number of entries to skip, not pages so needs some maths:
         var skipCount = (payload.page - 1) * payload.pageSize;
         this.serviceXhr({
            url: AlfConstants.PROXY_URI + "api/admin-sites?skipCount=" + skipCount + "&maxItems="+ payload.pageSize ,
            method: "GET",
            alfTopic: payload.responseTopic
         });
      },

      
      getSitesSuccess: function alfresco_services_SiteService__getSitesSuccess(response, originalRequestConfig) {
         if (ObjectTypeUtils.isArray(response))
         {
            var topic = originalRequestConfig.responseTopic || "ALF_SITES_LOADED";
            var sitesData = {
               items: response
            };
            this.alfPublish(topic, sitesData);
         }
         else
         {
            this.alfLog("error", "The request to retrieve available sites returned a response that could not be interpreted", response, originalRequestConfig, this);
         }
      },

     
      getSiteDetails: function alfresco_services_SiteService__getSiteDetails(config) {
         if (config && config.site && config.responseTopic)
         {
            var url = AlfConstants.PROXY_URI + "api/sites/" + config.site;
            this.serviceXhr({url : url,
                             method: "GET",
                             site: config.site,
                             responseTopic: config.responseTopic,
                             successCallback: this.publishSiteDetails,
                             callbackScope: this});
         }
         else
         {
            this.alfLog("error", "A request to get the details of a site was made, but either the 'site' or 'responseTopic' attributes was not provided", config);
         }
      },

      publishSiteDetails: function alfresco_services_SiteService__publishSiteDetails(response, originalRequestConfig) {
         if (originalRequestConfig && originalRequestConfig.responseTopic)
         {
            this.alfLog("log", "Publishing site details", originalRequestConfig);
            this.alfPublish(originalRequestConfig.responseTopic, response);
         }
         else
         {
            this.alfLog("error", "It was not possible to publish requested site details because the 'responseTopic' attribute was not set on the original request", response, originalRequestConfig);
         }
      },

      
      updateSite: function alfresco_services_SiteService__updateSite(payload) {
         var shortName = lang.getObject("shortName", false, payload);
         if (shortName)
         {
            var url = AlfConstants.PROXY_URI + "api/sites/" + shortName;
            this.serviceXhr({
               url: url,
               method: "PUT",
               data: payload,
               alfTopic: payload.responseTopic
            });
         }
         else
         {
            this.alfLog("warn", "A request was made to update a site but no 'shortName' attribute was provided", payload, this);
         }
      },

     
      onActionDeleteSite: function alfresco_services_SiteService__onActionDeleteSite(payload) {
         var shortName = lang.getObject("document.shortName", false, payload) || lang.getObject("shortName", false, payload);
         if (shortName)
         {
            var responseTopic = this.generateUuid();
            this._actionDeleteHandle = this.alfSubscribe(responseTopic, lang.hitch(this, "onActionDeleteSiteConfirmation"), false);

            this.alfPublish("ALF_CREATE_DIALOG_REQUEST", {
               dialogId: "ALF_SITE_SERVICE_DIALOG",
               dialogTitle: this.message("message.delete-site-confirm-title"),
               textContent: this.message("message.delete-site-prompt", { "0": shortName}),
               widgetsButtons: [
                  {
                     id: "ALF_SITE_SERVICE_DIALOG_CONFIRMATION",
                     name: "alfresco/buttons/AlfButton",
                     config: {
                        label: this.message("button.delete-site.confirm-label"),
                        publishTopic: this.pubSubScope + responseTopic,
                        publishPayload: payload
                     }
                  },
                  {
                     id: "ALF_SITE_SERVICE_DIALOG_CANCELLATION",
                     name: "alfresco/buttons/AlfButton",
                     config: {
                        label: this.message("button.delete-site.cancel-label"),
                        publishTopic: "close"
                     }
                  }
               ]
            });
         }
         else
         {
            this.alfLog("warn", "A request was made to delete a site but no 'shortName' attribute was provided", document, this);
         }
      },

      onActionDeleteSiteConfirmation: function alfresco_services_SiteService__onActionDeleteSiteConfirmation(payload) {
         this.alfUnsubscribeSaveHandles([this._actionDeleteHandle]);
         var responseTopic = this.generateUuid();
         var subscriptionHandle = this.alfSubscribe(responseTopic + "_SUCCESS", lang.hitch(this, this.onActionDeleteSiteSuccess), false);
         var shortName = lang.getObject("document.shortName", false, payload) || lang.getObject("shortName", false, payload);
         if (shortName)
         {
            var url = AlfConstants.PROXY_URI + "api/sites/" + shortName;
            this.serviceXhr({
               alfTopic: responseTopic,
               subscriptionHandle: subscriptionHandle,
               url: url,
               data: payload,
               method: "DELETE"
            });
         }
         else
         {
            this.alfLog("warn", "A request was made to delete a site but no 'shortName' attribute was provided", document, this);
         }
      },

     
      onActionDeleteSiteSuccess: function alfresco_services_SiteService__onActionDeleteSiteSuccess(payload) {
         var subscriptionHandle = lang.getObject("requestConfig.subscriptionHandle", false, payload);
         if (subscriptionHandle)
         {
            this.alfUnsubscribe(subscriptionHandle);
         }

         var redirect = lang.getObject("requestConfig.data.redirect", false, payload);
         if (redirect)
         {
            this.alfServicePublish(topics.NAVIGATE_TO_PAGE, {
               url: redirect.url,
               type: redirect.type,
               target: redirect.target
            });
         }
         else
         {
            this.reloadData();
         }
      },

      
      addSiteAsFavourite: function alfresco_services_SiteService__addSiteAsFavourite(payload) {
         if (payload.site && payload.user)
         {
            // Set up the favourites information...
            var url = AlfConstants.PROXY_URI + "api/people/" + encodeURIComponent(payload.user) + "/preferences",
                favObj = {org:{alfresco:{share:{sites:{favourites:{}}}}}};
            favObj.org.alfresco.share.sites.favourites[payload.site] = true;
            this.serviceXhr({url : url,
                             site: payload.site,
                             user: payload.user,
                             title: payload.title,
                             data: favObj,
                             method: "POST",
                             successCallback: this.favouriteSiteAdded,
                             callbackScope: this,
                             alfResponseScope: payload.alfResponseScope});
         }
         else
         {
            // Handle error conditions...
            this.alfLog("error", "A request to make a site a favourite but either the site or user was not specified", payload);
         }
      },

      
      favouriteSiteAdded: function alfresco_services_SiteService__favouriteSiteAdded(response, originalRequestConfig) {
         this.alfLog("log", "Favourite Site Added Successfully", response, originalRequestConfig);
         this.alfPublish("ALF_FAVOURITE_SITE_ADDED", {
            site: originalRequestConfig.site,
            user: originalRequestConfig.user,
            title: originalRequestConfig.title
         }, false, false, originalRequestConfig.alfResponseScope);
      }

});
