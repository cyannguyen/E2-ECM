/*
 * #%L
 * Alfresco Remote API
 * %%
 * Copyright (C) 2005 - 2016 Alfresco Software Limited
 * %%
 * This file is part of the Alfresco software. 
 * If the software was purchased under a paid Alfresco license, the terms of 
 * the paid license agreement will prevail.  Otherwise, the software is 
 * provided under the following open source license terms:
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
 * #L%
 */
package org.alfresco.rest.api;

import java.util.Map;

import org.alfresco.rest.api.model.Node;
import org.alfresco.rest.api.model.NodeTargetAssoc;
import org.alfresco.rest.api.model.Rendition;
import org.alfresco.rest.api.model.UserInfo;
import org.alfresco.rest.framework.resource.content.BinaryResource;
import org.alfresco.rest.framework.resource.parameters.CollectionWithPagingInfo;
import org.alfresco.rest.framework.resource.parameters.Parameters;

/**
 * Handles trashcan / deleted nodes
 *
 * @author Gethin James
 */
public interface DeletedNodes
{
    /**
     * Lists deleted nodes using a ArchivedNodesCannedQuery
     * @param parameters
     * @return Collection of deleted Nodes
     */
    CollectionWithPagingInfo<Node> listDeleted(Parameters parameters);

    /**
     * Gets a single deleted node by id.
     * @param originalId
     * @param parameters
     * @param fullnode Should we return the full representation of the minimal one?
     * @param mapUserInfo
     * @return a deleted node
     */
    Node getDeletedNode(String originalId, Parameters parameters, boolean fullnode, Map<String, UserInfo> mapUserInfo);

    /**
     * Restores a deleted node and returns it.
     * 
     * @param archivedId
     * @param nodeTargetAssoc
     *            - optional
     * @return the new undeleted node.
     */
    Node restoreArchivedNode(String archivedId, NodeTargetAssoc nodeTargetAssoc);

    /**
     * Permanently delete the node.
     * @param archivedId
     */
    void purgeArchivedNode(String archivedId);

    /**
     * Download file content (or rendition content) via archived node.
     *
     * @param archivedId
     * @param renditionId
     *            - optional
     * @param parameters
     *            {@link Parameters}
     * @return
     */
    BinaryResource getContent(String archivedId, String renditionId, Parameters parameters);

    /**
     * @param archivedId
     * @param renditionId
     * @return
     */
    Rendition getRendition(String archivedId, String renditionId, Parameters parameters);

    /**
     * @param archivedId
     * @return
     */
    CollectionWithPagingInfo<Rendition> getRenditions(String archivedId, Parameters parameters);
}
