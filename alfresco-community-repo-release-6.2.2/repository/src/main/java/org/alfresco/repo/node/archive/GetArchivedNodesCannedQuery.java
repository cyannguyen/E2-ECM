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

package org.alfresco.repo.node.archive;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.alfresco.model.ContentModel;
import org.alfresco.query.CannedQueryParameters;
import org.alfresco.repo.domain.node.NodeDAO;
import org.alfresco.repo.domain.query.CannedQueryDAO;
import org.alfresco.repo.security.permissions.impl.acegi.AbstractCannedQueryPermissions;
import org.alfresco.repo.security.permissions.impl.acegi.MethodSecurityBean;
import org.alfresco.service.cmr.repository.InvalidNodeRefException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeRef.Status;
import org.alfresco.util.Pair;
import org.alfresco.util.ParameterCheck;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/**
 * Canned query for archived nodes.
 * 
 * @author Jamal Kaabi-Mofrad
 * @since 4.2
 */
public class GetArchivedNodesCannedQuery extends AbstractCannedQueryPermissions<ArchivedNodeEntity>
{
    private Log logger = LogFactory.getLog(GetArchivedNodesCannedQuery.class);

    private static final String QUERY_NAMESPACE = "alfresco.query.archivednodes";
    private static final String QUERY_SELECT_GET_ARCHIVED_NODES = "select_GetArchivedNodesCannedQuery";

    private CannedQueryDAO cannedQueryDAO;
    private NodeDAO nodeDAO;

    public GetArchivedNodesCannedQuery(CannedQueryDAO cannedQueryDAO, NodeDAO nodeDAO,
                MethodSecurityBean<ArchivedNodeEntity> methodSecurity, CannedQueryParameters params)
    {
        super(params, methodSecurity);
        this.cannedQueryDAO = cannedQueryDAO;
        this.nodeDAO = nodeDAO;

    }

    @Override
    protected List<ArchivedNodeEntity> queryAndFilter(CannedQueryParameters parameters)
    {
        Long start = (logger.isDebugEnabled() ? System.currentTimeMillis() : null);

        Object paramBeanObj = parameters.getParameterBean();
        if (paramBeanObj == null)
            throw new NullPointerException("Null GetArchivedNodes query params");

        // Get parameters
        GetArchivedNodesCannedQueryParams paramBean = (GetArchivedNodesCannedQueryParams) paramBeanObj;
        
        if (paramBean.getParentNodeId() == null || paramBean.getParentNodeId() < 0)
        {
            return Collections.emptyList();
        }

        int resultsRequired = parameters.getResultsRequired();
        paramBean.setLimit(resultsRequired);
        String filterValue = paramBean.getFilter();
        paramBean.setFilter("*");
        System.out.println("Filter value: " + filterValue);
        System.out.println("Param Filter value: " + paramBean.getFilter());

        // note: refer to SQL for specific DB filtering and sorting
        List<ArchivedNodeEntity> allResults = cannedQueryDAO.executeQuery(QUERY_NAMESPACE,
                    QUERY_SELECT_GET_ARCHIVED_NODES, paramBean, 0, Integer.MAX_VALUE);
        
        List<ArchivedNodeEntity> results = new ArrayList<ArchivedNodeEntity>();
        for (ArchivedNodeEntity entity : allResults)
        {
        	if(!StringUtils.isEmpty(filterValue)) {
        		filterValue = filterValue.trim().toLowerCase().replaceAll("%", "");
        		Date filterDate = null;
        		try {
        			String[] formats = {"dd/MM/yyyy", "dd-MM-yyyy"};
        			filterDate = DateUtils.parseDate(filterValue, formats);
        		} catch(Exception e) {
        			System.out.println("Cannot parse date: " + filterValue);
        		}
        		
        		System.out.println(filterValue);
        		Long nodeId = getNodePairNotNull(entity.getNodeRef()).getFirst();
            	String name = (String) nodeDAO.getNodeProperty(nodeId, ContentModel.PROP_NAME);
            	System.out.println(name);
            	String archivedBy = (String) nodeDAO.getNodeProperty(nodeId, ContentModel.PROP_ARCHIVED_BY);
            	System.out.println(archivedBy);
            	Date archiveDate  = (Date) nodeDAO.getNodeProperty(nodeId, ContentModel.PROP_ARCHIVED_DATE);
            	System.out.println(archiveDate);
            	if(name.toLowerCase().contains(filterValue) || archivedBy.toLowerCase().contains(filterValue) || (filterDate != null && DateUtils.isSameDay(filterDate, archiveDate))) {
            		results.add(entity);
            	}
            	
        	} else {
        		results.add(entity);
        	}
        	
        }
        List<NodeRef> nodeRefs = new ArrayList<NodeRef>(results.size());
        for (ArchivedNodeEntity entity : results)
        {
        	nodeRefs.add(entity.getNodeRef());
        }

        // preload the node for later when we want to get the properties of the node
        preload(nodeRefs);

        if (start != null)
        {
            logger.debug("Base query: " + nodeRefs.size() + " in "
                        + (System.currentTimeMillis() - start) + " msecs");
        }

        return results;

    }
    
    private Pair<Long, NodeRef> getNodePairNotNull(NodeRef nodeRef) throws InvalidNodeRefException
    {
        ParameterCheck.mandatory("nodeRef", nodeRef);
        
        Pair<Long, NodeRef> unchecked = nodeDAO.getNodePair(nodeRef);
        if (unchecked == null)
        {
            Status nodeStatus = nodeDAO.getNodeRefStatus(nodeRef);
            throw new InvalidNodeRefException("Node does not exist: " + nodeRef + " (status:" + nodeStatus + ")", nodeRef);
        }
        return unchecked;
    }

    private void preload(List<NodeRef> nodeRefs)
    {
        Long start = (logger.isTraceEnabled() ? System.currentTimeMillis() : null);

        nodeDAO.cacheNodes(nodeRefs);

        if (start != null)
        {
            logger.trace("Pre-load: " + nodeRefs.size() + " in "
                        + (System.currentTimeMillis() - start) + " msecs");
        }
    }
}
