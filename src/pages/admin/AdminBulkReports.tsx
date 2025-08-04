import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiDownload, FiFilter, FiCalendar, FiUsers, FiFileText, FiMail, FiSettings, FiPlay, FiClock, FiCheck, FiX } from "react-icons/fi";
import { MdOutlineAnalytics } from "react-icons/md";
import { ROUTES } from '@/config/route-paths.config';
import { theme } from '@/config/theme.config';
import Swal from "sweetalert2";

// Mock data for report templates
const reportTemplates = [
  {
    id: 'patient-services-summary',
    name: 'Patient Services Summary',
    description: 'Comprehensive overview of services taken by patients',
    type: 'summary',
    icon: <FiUsers size={20} />,
    estimatedTime: '2-5 minutes',
    fields: ['patient_info', 'services', 'costs', 'dates', 'doctors']
  },
  {
    id: 'financial-report',
    name: 'Financial Services Report',
    description: 'Revenue and payment analysis across services',
    type: 'financial',
    icon: <FiFileText size={20} />,
    estimatedTime: '3-7 minutes',
    fields: ['services', 'costs', 'payments', 'revenue_breakdown']
  },
  {
    id: 'service-utilization',
    name: 'Service Utilization Report',
    description: 'Analysis of service popularity and usage patterns',
    type: 'analytics',
    icon: <MdOutlineAnalytics size={20} />,
    estimatedTime: '5-10 minutes',
    fields: ['services', 'usage_stats', 'trends', 'comparisons']
  },
  {
    id: 'doctor-services',
    name: 'Doctor Services Report',
    description: 'Services performed by each doctor with performance metrics',
    type: 'performance',
    icon: <FiUsers size={20} />,
    estimatedTime: '3-6 minutes',
    fields: ['doctors', 'services', 'performance_metrics', 'patient_feedback']
  }
];

// Mock data for recent reports
const recentReports = [
  {
    id: 'rpt-001',
    name: 'Patient Services Summary - February 2024',
    template: 'patient-services-summary',
    status: 'completed',
    createdAt: '2024-02-15T10:30:00Z',
    completedAt: '2024-02-15T10:33:00Z',
    fileSize: '2.4 MB',
    recordCount: 156,
    downloadUrl: '/reports/patient-services-feb-2024.pdf'
  },
  {
    id: 'rpt-002',
    name: 'Financial Report - Q1 2024',
    template: 'financial-report',
    status: 'generating',
    createdAt: '2024-02-16T09:15:00Z',
    completedAt: null,
    fileSize: null,
    recordCount: 89,
    downloadUrl: null,
    progress: 65
  },
  {
    id: 'rpt-003',
    name: 'Service Utilization - January 2024',
    template: 'service-utilization',
    status: 'failed',
    createdAt: '2024-02-14T14:20:00Z',
    completedAt: null,
    fileSize: null,
    recordCount: 0,
    downloadUrl: null,
    error: 'Insufficient data for the selected period'
  }
];

interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  patients: string[];
  services: string[];
  doctors: string[];
  categories: string[];
  status: string[];
  paymentStatus: string[];
}

const AdminBulkReports = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [emailReport, setEmailReport] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0] // today
    },
    patients: [],
    services: [],
    doctors: [],
    categories: [],
    status: [],
    paymentStatus: []
  });

  // Pre-populate from URL params if coming from other pages
  useEffect(() => {
    const servicesParam = searchParams.get('services');
    const patientsParam = searchParams.get('patients');
    
    if (servicesParam) {
      setFilters(prev => ({
        ...prev,
        services: servicesParam.split(',')
      }));
      setShowAdvancedFilters(true);
    }
    
    if (patientsParam) {
      setFilters(prev => ({
        ...prev,
        patients: patientsParam.split(',')
      }));
      setShowAdvancedFilters(true);
    }
  }, [searchParams]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setReportName(`${template.name} - ${new Date().toLocaleDateString('en-IN')}`);
    }
  };

  const handleFilterChange = (filterType: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const validateReportConfiguration = (): boolean => {
    if (!selectedTemplate) {
      Swal.fire({
        title: 'Template Required',
        text: 'Please select a report template to continue.',
        icon: 'warning'
      });
      return false;
    }

    if (!reportName.trim()) {
      Swal.fire({
        title: 'Report Name Required',
        text: 'Please provide a name for your report.',
        icon: 'warning'
      });
      return false;
    }

    if (emailReport && !emailRecipients.trim()) {
      Swal.fire({
        title: 'Email Recipients Required',
        text: 'Please provide email addresses to send the report to.',
        icon: 'warning'
      });
      return false;
    }

    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    if (startDate > endDate) {
      Swal.fire({
        title: 'Invalid Date Range',
        text: 'Start date must be before end date.',
        icon: 'warning'
      });
      return false;
    }

    return true;
  };

  const handleGenerateReport = async () => {
    if (!validateReportConfiguration()) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const reportConfig = {
        template: selectedTemplate,
        name: reportName,
        format: reportFormat,
        filters,
        emailReport,
        emailRecipients: emailReport ? emailRecipients.split(',').map(email => email.trim()) : []
      };

      // TODO: Implement actual report generation API call
      console.log('Generating report with config:', reportConfig);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Swal.fire({
        title: 'Report Generation Started!',
        text: `Your report "${reportName}" has been queued for generation. ${emailReport ? 'You will receive an email when it\'s ready.' : 'Check the Recent Reports section for updates.'}`,
        icon: 'success',
        timer: 4000,
        showConfirmButton: true
      });

      // Reset form
      setSelectedTemplate('');
      setReportName('');
      setEmailReport(false);
      setEmailRecipients('');
      
    } catch (error) {
      console.error('Error generating report:', error);
      Swal.fire({
        title: 'Generation Failed',
        text: 'Failed to start report generation. Please try again.',
        icon: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, downloadUrl: string, reportName: string) => {
    try {
      // TODO: Implement actual download logic
      console.log('Downloading report:', reportId, downloadUrl);
      
      // Simulate download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${reportName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire({
        title: 'Download Started',
        text: 'Your report download has started.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Download Failed',
        text: 'Failed to download report. Please try again.',
        icon: 'error'
      });
    }
  };

  const handleDeleteReport = async (reportId: string, reportName: string) => {
    const result = await Swal.fire({
      title: `Delete "${reportName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      // TODO: Implement delete report API call
      console.log('Deleting report:', reportId);
      
      Swal.fire({
        title: 'Success!',
        text: 'Report has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleBackToPatientServices = () => {
    navigate(ROUTES.ADMIN.PATIENT_SERVICES);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'generating': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'completed': return '#d1fae5';
      case 'generating': return '#fef3c7';
      case 'failed': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <BackLink onClick={handleBackToPatientServices}>
            ← Back to Patient Services
          </BackLink>
          <Title>
            <FiFileText size={28} />
            Bulk Reports Generator
          </Title>
          <Subtitle>Generate comprehensive reports for patient services and analytics</Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        <ReportGeneratorSection>
          <SectionTitle>Generate New Report</SectionTitle>
          
          <ReportTemplates>
            <TemplatesTitle>Select Report Template</TemplatesTitle>
            <TemplatesGrid>
              {reportTemplates.map(template => (
                <TemplateCard 
                  key={template.id}
                  selected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <TemplateIcon>{template.icon}</TemplateIcon>
                  <TemplateInfo>
                    <TemplateName>{template.name}</TemplateName>
                    <TemplateDescription>{template.description}</TemplateDescription>
                    <TemplateTime>
                      <FiClock size={12} />
                      Est. {template.estimatedTime}
                    </TemplateTime>
                  </TemplateInfo>
                  {selectedTemplate === template.id && (
                    <SelectedIndicator>
                      <FiCheck size={16} />
                    </SelectedIndicator>
                  )}
                </TemplateCard>
              ))}
            </TemplatesGrid>
          </ReportTemplates>

          {selectedTemplate && (
            <ReportConfiguration>
              <ConfigurationTitle>Report Configuration</ConfigurationTitle>
              
              <ConfigForm>
                <FormRow>
                  <FormGroup>
                    <Label>Report Name *</Label>
                    <Input
                      type="text"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Format</Label>
                    <Select value={reportFormat} onChange={(e) => setReportFormat(e.target.value as any)}>
                      <option value="PDF">PDF Document</option>
                      <option value="Excel">Excel Spreadsheet</option>
                      <option value="CSV">CSV File</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>Date Range *</Label>
                    <DateRangeInputs>
                      <Input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                      />
                      <DateRangeSeparator>to</DateRangeSeparator>
                      <Input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                      />
                    </DateRangeInputs>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <AdvancedFiltersToggle onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                    <FiFilter size={16} />
                    Advanced Filters
                    {showAdvancedFilters ? <span>▼</span> : <span>▶</span>}
                  </AdvancedFiltersToggle>
                </FormRow>

                {showAdvancedFilters && (
                  <AdvancedFiltersSection>
                    <FiltersGrid>
                      <FilterGroup>
                        <FilterLabel>Service Status</FilterLabel>
                        <CheckboxGroup>
                          {['scheduled', 'completed', 'cancelled'].map(status => (
                            <CheckboxItem key={status}>
                              <input
                                type="checkbox"
                                checked={filters.status.includes(status)}
                                onChange={(e) => {
                                  const newStatus = e.target.checked
                                    ? [...filters.status, status]
                                    : filters.status.filter(s => s !== status);
                                  handleFilterChange('status', newStatus);
                                }}
                              />
                              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                            </CheckboxItem>
                          ))}
                        </CheckboxGroup>
                      </FilterGroup>

                      <FilterGroup>
                        <FilterLabel>Payment Status</FilterLabel>
                        <CheckboxGroup>
                          {['paid', 'pending', 'partial', 'refunded'].map(paymentStatus => (
                            <CheckboxItem key={paymentStatus}>
                              <input
                                type="checkbox"
                                checked={filters.paymentStatus.includes(paymentStatus)}
                                onChange={(e) => {
                                  const newPaymentStatus = e.target.checked
                                    ? [...filters.paymentStatus, paymentStatus]
                                    : filters.paymentStatus.filter(s => s !== paymentStatus);
                                  handleFilterChange('paymentStatus', newPaymentStatus);
                                }}
                              />
                              <span>{paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</span>
                            </CheckboxItem>
                          ))}
                        </CheckboxGroup>
                      </FilterGroup>
                    </FiltersGrid>
                  </AdvancedFiltersSection>
                )}

                <FormRow>
                  <EmailSection>
                    <EmailToggle>
                      <input
                        type="checkbox"
                        checked={emailReport}
                        onChange={(e) => setEmailReport(e.target.checked)}
                      />
                      <EmailToggleLabel>
                        <FiMail size={16} />
                        Email report when ready
                      </EmailToggleLabel>
                    </EmailToggle>
                    
                    {emailReport && (
                      <EmailInput>
                        <Input
                          type="text"
                          value={emailRecipients}
                          onChange={(e) => setEmailRecipients(e.target.value)}
                          placeholder="Enter email addresses (comma separated)"
                        />
                      </EmailInput>
                    )}
                  </EmailSection>
                </FormRow>

                <GenerateButtonContainer>
                  <GenerateButton onClick={handleGenerateReport} disabled={isGenerating}>
                    <FiPlay size={16} />
                    {isGenerating ? 'Generating Report...' : 'Generate Report'}
                  </GenerateButton>
                </GenerateButtonContainer>
              </ConfigForm>
            </ReportConfiguration>
          )}
        </ReportGeneratorSection>

        <RecentReportsSection>
          <SectionTitle>Recent Reports</SectionTitle>
          
          <ReportsList>
            {recentReports.map(report => (
              <ReportCard key={report.id}>
                <ReportCardHeader>
                  <ReportInfo>
                    <ReportName>{report.name}</ReportName>
                    <ReportMeta>
                      <ReportDate>Created: {new Date(report.createdAt).toLocaleString('en-IN')}</ReportDate>
                      {report.recordCount > 0 && (
                        <RecordCount>{report.recordCount} records</RecordCount>
                      )}
                    </ReportMeta>
                  </ReportInfo>
                  
                  <ReportStatus 
                    status={report.status}
                    color={getStatusColor(report.status)}
                    background={getStatusBackground(report.status)}
                  >
                    {report.status === 'generating' && report.progress && (
                      <ProgressBar>
                        <ProgressFill width={report.progress} />
                        <ProgressText>{report.progress}%</ProgressText>
                      </ProgressBar>
                    )}
                    {report.status !== 'generating' && report.status}
                    {report.status === 'failed' && report.error && (
                      <ErrorTooltip title={report.error}>ⓘ</ErrorTooltip>
                    )}
                  </ReportStatus>
                </ReportCardHeader>
                
                <ReportCardFooter>
                  <ReportDetails>
                    {report.fileSize && <FileSize>Size: {report.fileSize}</FileSize>}
                    {report.completedAt && (
                      <CompletedTime>
                        Completed: {new Date(report.completedAt).toLocaleString('en-IN')}
                      </CompletedTime>
                    )}
                  </ReportDetails>
                  
                  <ReportActions>
                    {report.status === 'completed' && report.downloadUrl && (
                      <ActionButton 
                        variant="download"
                        onClick={() => handleDownloadReport(report.id, report.downloadUrl!, report.name)}
                      >
                        <FiDownload size={14} />
                        Download
                      </ActionButton>
                    )}
                    <ActionButton 
                      variant="delete"
                      onClick={() => handleDeleteReport(report.id, report.name)}
                    >
                      <FiX size={14} />
                      Delete
                    </ActionButton>
                  </ReportActions>
                </ReportCardFooter>
              </ReportCard>
            ))}
          </ReportsList>
          
          {recentReports.length === 0 && (
            <EmptyReports>
              <EmptyIcon>📊</EmptyIcon>
              <EmptyTitle>No Reports Yet</EmptyTitle>
              <EmptyMessage>Generate your first report using the form above.</EmptyMessage>
            </EmptyReports>
          )}
        </RecentReportsSection>
      </MainContent>

      {isGenerating && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Generating report...</LoadingText>
          <LoadingSubtext>This may take a few minutes depending on the data size</LoadingSubtext>
        </LoadingOverlay>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
`;

const Header = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;
`;

const HeaderContent = styled.div``;

const BackLink = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ReportGeneratorSection = styled.div``;

const RecentReportsSection = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
`;

const ReportTemplates = styled.div`
  margin-bottom: 32px;
`;

const TemplatesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const TemplateCard = styled.div<{ selected: boolean }>`
  position: relative;
  background: white;
  border: 2px solid ${props => props.selected ? theme.colors.primary : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateIcon = styled.div`
  color: ${theme.colors.primary};
  margin-bottom: 12px;
`;

const TemplateInfo = styled.div``;

const TemplateName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const TemplateDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0 0 8px 0;
`;

const TemplateTime = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: ${theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReportConfiguration = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const ConfigurationTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
`;

const ConfigForm = styled.div``;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const DateRangeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateRangeSeparator = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const AdvancedFiltersToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: ${theme.colors.primary};
  }
`;

const AdvancedFiltersSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-top: -8px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const FilterGroup = styled.div``;

const FilterLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const EmailSection = styled.div`
  width: 100%;
`;

const EmailToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 12px;
  
  input[type="checkbox"] {
    margin: 0;
  }
`;

const EmailToggleLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #374151;
`;

const EmailInput = styled.div`
  margin-left: 24px;
`;

const GenerateButtonContainer = styled.div`
  text-align: center;
  margin-top: 24px;
`;

const GenerateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${theme.colors.primary}dd;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReportsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReportCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ReportCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ReportInfo = styled.div`
  flex: 1;
`;

const ReportName = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
`;

const ReportMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ReportDate = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const RecordCount = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const ReportStatus = styled.div<{ status: string; color: string; background: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${props => props.background};
  color: ${props => props.color};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  min-width: 80px;
  justify-content: center;
`;

const ProgressBar = styled.div`
  position: relative;
  width: 60px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: currentColor;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.span`
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 600;
`;

const ErrorTooltip = styled.span`
  cursor: help;
  font-size: 12px;
  margin-left: 4px;
`;

const ReportCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReportDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileSize = styled.span`
  font-size: 10px;
  color: #6b7280;
`;

const CompletedTime = styled.span`
  font-size: 10px;
  color: #059669;
`;

const ReportActions = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button<{ variant?: 'download' | 'delete' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props.variant === 'download') {
      return `
        background: #dbeafe;
        color: #1e40af;
        &:hover {
          background: #bfdbfe;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === 'delete') {
      return `
        background: #fee2e2;
        color: #dc2626;
        &:hover {
          background: #fecaca;
          transform: translateY(-1px);
        }
      `;
    }
  }}
`;

const EmptyReports = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 6px 0;
`;

const EmptyMessage = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 0;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
`;

const LoadingSubtext = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-align: center;
`;

export default AdminBulkReports;