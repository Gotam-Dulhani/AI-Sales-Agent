"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  Filter, 
  Search, 
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react'

interface Lead {
  id: number
  customer_id: number
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  source: 'whatsapp' | 'website' | 'referral' | 'other'
  score: number
  interest_level: 'high' | 'medium' | 'low'
  budget?: string
  timeline?: string
  notes?: string
  created_at: string
  updated_at?: string
}

interface LeadStats {
  total_leads: number
  new_leads: number
  qualified_leads: number
  converted_leads: number
  conversion_rate: number
}

export default function LeadManagement({ businessId }: { businessId: number }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    loadLeads()
    loadStats()
  }, [businessId])

  const loadLeads = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:8000/api/leads?business_id=${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:8000/api/analytics/dashboard?business_id=${businessId}&period=weekly`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data.lead_analytics)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const qualifyLead = async (leadId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:8000/api/leads/${leadId}/qualify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const qualification = await response.json()
        loadLeads()
        loadStats()
        alert(`Lead qualified! Score: ${qualification.score}, Interest: ${qualification.interest_level}`)
      }
    } catch (error) {
      console.error('Error qualifying lead:', error)
    }
  }

  const convertLead = async (leadId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:8000/api/leads/${leadId}/convert`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        loadLeads()
        loadStats()
        alert('Lead converted successfully!')
      }
    } catch (error) {
      console.error('Error converting lead:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500'
      case 'contacted':
        return 'bg-yellow-500'
      case 'qualified':
        return 'bg-green-500'
      case 'converted':
        return 'bg-purple-500'
      case 'lost':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getInterestIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      case 'medium':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Star className="h-4 w-4 text-gray-400" />
      default:
        return null
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = filter === 'all' || lead.status === filter
    const matchesSearch = 
      searchQuery === '' ||
      lead.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.budget?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.total_leads}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.new_leads}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Qualified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.qualified_leads}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{stats.conversion_rate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'new' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new')}
          >
            New
          </Button>
          <Button
            variant={filter === 'qualified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('qualified')}
          >
            Qualified
          </Button>
          <Button
            variant={filter === 'converted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('converted')}
          >
            Converted
          </Button>
        </div>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No leads found
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{lead.source}</Badge>
                      {lead.interest_level && (
                        <div className="flex items-center gap-1">
                          {getInterestIcon(lead.interest_level)}
                          <span className="text-sm text-muted-foreground capitalize">
                            {lead.interest_level}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score:</span>
                        <span className="ml-2 font-medium">{lead.score.toFixed(0)}/100</span>
                      </div>
                      {lead.budget && (
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <span className="ml-2 font-medium">{lead.budget}</span>
                        </div>
                      )}
                      {lead.timeline && (
                        <div>
                          <span className="text-muted-foreground">Timeline:</span>
                          <span className="ml-2 font-medium">{lead.timeline}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {lead.notes && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {lead.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {lead.status !== 'qualified' && lead.status !== 'converted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => qualifyLead(lead.id)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Qualify
                      </Button>
                    )}
                    {lead.status === 'qualified' && (
                      <Button
                        size="sm"
                        onClick={() => convertLead(lead.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
