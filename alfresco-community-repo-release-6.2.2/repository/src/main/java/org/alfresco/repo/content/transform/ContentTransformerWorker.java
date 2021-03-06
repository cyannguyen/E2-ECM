/*
 * #%L
 * Alfresco Repository
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
package org.alfresco.repo.content.transform;

import org.alfresco.api.AlfrescoPublicApi;     
import org.alfresco.service.cmr.repository.ContentReader;
import org.alfresco.service.cmr.repository.ContentWriter;
import org.alfresco.service.cmr.repository.TransformationOptions;

/**
 * An interface that allows separation between the content transformer registry and the various third party subsystems
 * performing the transformation.
 * 
 * @author dward
 *
 * @deprecated The transformations code is being moved out of the codebase and replaced by the new async RenditionService2 or other external libraries.
 */
// TODO Modify ContentTransformerWorker to understand transformer limits. At the moment no workers use them
@Deprecated
@AlfrescoPublicApi
public interface ContentTransformerWorker
{
    /**
     * Checks if this worker is available.
     * 
     * @return true if it is available
     */
    public boolean isAvailable();

    /**
     * Gets a string returning product and version information.
     * 
     * @return the version string
     */
    public String getVersionString();

    /**
     * Unlike {@link ContentTransformer#isTransformable(String, String, TransformationOptions)} 
     * should not include the transformer name, as that is added by the ContentTransformer in
     * the parent context.
     */
    public boolean isTransformable(String sourceMimetype, String targetMimetype, TransformationOptions options);    

    /**
     * @see ContentTransformer#getComments(boolean)
     */
    public String getComments(boolean available);

    /**
     * @see ContentTransformer#transform(ContentReader, ContentWriter, TransformationOptions)
     */
    public void transform(ContentReader reader, ContentWriter writer, TransformationOptions options) throws Exception;

    /**
     * @return true if ther worker is using a remote server.
     */
    public default boolean remoteTransformerClientConfigured()
    {
        return false;
    }

    public void setRemoteTransformerClient(RemoteTransformerClient remoteTransformerClient);
}
