/*
 * Copyright 2005 - 2020 Alfresco Software Limited.
 *
 * This file is part of the Alfresco software.
 * If the software was purchased under a paid Alfresco license, the terms of the paid license agreement will prevail.
 * Otherwise, the software is provided under the following open source license terms:
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */
package org.alfresco.module.org_alfresco_module_wcmquickstart.util.contextparser;

import org.alfresco.module.org_alfresco_module_wcmquickstart.model.WebSiteModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.security.OwnableService;

/**
 * Website owner parser
 * 
 * @author Roy Wetherall
 */
public class WebsiteOwnerContextParser extends ContextParser implements WebSiteModel
{	
	/** Ownable service */
	private OwnableService ownableService;
	
	/** 
	 * Sets the ownable service
	 * @param ownableService	ownable service
	 */
	public void setOwnableService(OwnableService ownableService)
    {
	    this.ownableService = ownableService;
    }
	
	/**
	 * @see org.alfresco.module.org_alfresco_module_wcmquickstart.util.contextparser.ContextParser#execute(org.alfresco.service.cmr.repository.NodeRef)
	 */
	@Override
	public String execute(NodeRef context)
	{	
		String result = null;
		NodeRef nodeRef = siteHelper.getRelevantWebSite(context);
		if (nodeRef != null)
		{
			result = ownableService.getOwner(nodeRef);
		}
		return result;
	}

}
