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
package org.alfresco.module.org_alfresco_module_wcmquickstart.jobs.feedback;

import org.alfresco.service.cmr.repository.NodeRef;

/**
 * Feedback processor handler interface.  Each processor handler deals with a 
 * different type of feedback.
 * 
 * @author Roy Wetherall
 */
public interface FeedbackProcessorHandler
{
    /**
     * Gets the type of feedback this handler deals with.
     * @return  String  feedback type.
     */
    String getFeedbackType();
    
    /**
     * Process given feedback node.
     * @param feedback  node reference to feedback
     */
    void processFeedback(NodeRef feedback);
    
    /**
     * Process feedback callback.  
     * <p>
     * Called once every time the feedback processor has completed
     * processing of all feedback nodes, providing opportunity to do some last minute processing.
     */
    void processorCallback();
}
