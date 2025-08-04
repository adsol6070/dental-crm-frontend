import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  FiDownload,
  FiCalendar,
  FiUser,
  FiFileText,
  FiFilter,
  FiPlay,
  FiClock,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { MdOutlineAnalytics } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";
import Swal from "sweetalert2";

// Mock data for doctor's patients and recent reports
const mockPatients = [
  {
    _id: "p1",
    name: "John Smith",
    patientId: "PAT-001",
    totalServices: 3,
    lastVisit: "2024-02-10",
  },
  {
    _id: "p2",
    name: "Emily Davis",
    patientId: "PAT-002",
    totalServices: 2,
    lastVisit: "2024-02-12",
  },
  {
    _id: "p3",
    name: "Michael Johnson",
    patientId: "PAT-003",
    totalServices: 1,
    lastVisit: "2024-01-25",
  },
  {
    _id: "p4",
    name: "Sarah Brown",
    patientId: "PAT-004",
    totalServices: 4,
    lastVisit: "2024-02-08",
  },
  {
    _id: "p5",
    name: "David Wilson",
    patientId: "PAT-005",
    totalServices: 2,
    lastVisit: "2024-02-05",
  },
];

const reportTemplates = [
  {
    id: "patient-individual",
    name: "Individual Patient Report",
    description:
      "Detailed service history and treatment summary for a specific patient",
    icon: <FiUser size={20} />,
    estimatedTime: "1-2 minutes",
    requiresPatient: true,
  },
  {
    id: "my-services-summary",
    name: "My Services Summary",
    description: "Overview of all services you have performed in a date range",
    icon: <MdOutlineAnalytics size={20} />,
    estimatedTime: "2-3 minutes",
    requiresPatient: false,
  },
  {
    id: "performance-report",
    name: "Performance Report",
    description:
      "Your service statistics, completion rates, and patient feedback",
    icon: <FiFileText size={20} />,
    estimatedTime: "3-5 minutes",
    requiresPatient: false,
  },
];

const recentReports = [
  {
    id: "rpt-001",
    name: "John Smith - Service History",
    template: "patient-individual",
    status: "completed",
    createdAt: "2024-02-15T10:30:00Z",
    completedAt: "2024-02-15T10:32:00Z",
    fileSize: "1.2 MB",
    downloadUrl: "/reports/john-smith-history.pdf",
  },
  {
    id: "rpt-002",
    name: "My Services - February 2024",
    template: "my-services-summary",
    status: "generating",
    createdAt: "2024-02-16T09:15:00Z",
    completedAt: null,
    fileSize: null,
    downloadUrl: null,
    progress: 75,
  },
  {
    id: "rpt-003",
    name: "Performance Report - Q1 2024",
    template: "performance-report",
    status: "failed",
    createdAt: "2024-02-14T14:20:00Z",
    completedAt: null,
    fileSize: null,
    downloadUrl: null,
    error: "Insufficient data for the selected period",
  },
];

const DoctorServiceReports = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [reportName, setReportName] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [reportFormat, setReportFormat] = useState<"PDF" | "Excel">("PDF");
  const [isGenerating, setIsGenerating] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find((t) => t.id === templateId);
    if (template) {
      if (template.requiresPatient) {
        setReportName("");
      } else {
        setReportName(
          `${template.name} - ${new Date().toLocaleDateString("en-IN")}`
        );
      }
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
    const patient = mockPatients.find((p) => p._id === patientId);
    const template = reportTemplates.find((t) => t.id === selectedTemplate);

    if (patient && template) {
      setReportName(`${patient.name} - ${template.name}`);
    }
  };

  const validateReportConfiguration = (): boolean => {
    if (!selectedTemplate) {
      Swal.fire({
        title: "Template Required",
        text: "Please select a report template to continue.",
        icon: "warning",
      });
      return false;
    }

    const template = reportTemplates.find((t) => t.id === selectedTemplate);
    if (template?.requiresPatient && !selectedPatient) {
      Swal.fire({
        title: "Patient Required",
        text: "This report type requires selecting a patient.",
        icon: "warning",
      });
      return false;
    }

    if (!reportName.trim()) {
      Swal.fire({
        title: "Report Name Required",
        text: "Please provide a name for your report.",
        icon: "warning",
      });
      return false;
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    if (startDate > endDate) {
      Swal.fire({
        title: "Invalid Date Range",
        text: "Start date must be before end date.",
        icon: "warning",
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
        patientId: selectedPatient,
        name: reportName,
        format: reportFormat,
        dateRange,
        doctorId: "current-doctor-id", // Replace with actual doctor ID
      };

      // TODO: Implement actual report generation API call
      console.log("Generating report with config:", reportConfig);

      // Simulate report generation
      await new Promise((resolve) => setTimeout(resolve, 2500));

      Swal.fire({
        title: "Report Generation Started!",
        text: `Your report "${reportName}" has been queued for generation. Check the Recent Reports section for updates.`,
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      // Reset form
      setSelectedTemplate("");
      setSelectedPatient("");
      setReportName("");
    } catch (error) {
      console.error("Error generating report:", error);
      Swal.fire({
        title: "Generation Failed",
        text: "Failed to start report generation. Please try again.",
        icon: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (
    reportId: string,
    downloadUrl: string,
    reportName: string
  ) => {
    try {
      // TODO: Implement actual download logic
      console.log("Downloading report:", reportId, downloadUrl);

      // Simulate download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${reportName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        title: "Download Started",
        text: "Your report download has started.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Download Failed",
        text: "Failed to download report. Please try again.",
        icon: "error",
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
      console.log("Deleting report:", reportId);

      Swal.fire({
        title: "Success!",
        text: "Report has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "generating":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case "completed":
        return "#d1fae5";
      case "generating":
        return "#fef3c7";
      case "failed":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };

  // Filter patients based on search
  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <FiFileText size={28} />
            Service Reports
          </Title>
          <Subtitle>
            Generate detailed reports for your patients and service performance
          </Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        <ReportGeneratorSection>
          <SectionTitle>Generate New Report</SectionTitle>

          <ReportTemplates>
            <TemplatesTitle>Select Report Type</TemplatesTitle>
            <TemplatesGrid>
              {reportTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  selected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <TemplateIcon>{template.icon}</TemplateIcon>
                  <TemplateInfo>
                    <TemplateName>{template.name}</TemplateName>
                    <TemplateDescription>
                      {template.description}
                    </TemplateDescription>
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
                {reportTemplates.find((t) => t.id === selectedTemplate)
                  ?.requiresPatient && (
                  <FormGroup>
                    <Label>Select Patient *</Label>
                    <PatientSearchContainer>
                      <PatientSearchInput
                        type="text"
                        placeholder="Search patients..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                      <PatientDropdown>
                        {filteredPatients.map((patient) => (
                          <PatientOption
                            key={patient._id}
                            selected={selectedPatient === patient._id}
                            onClick={() => handlePatientSelect(patient._id)}
                          >
                            <PatientOptionInfo>
                              <PatientOptionName>
                                {patient.name}
                              </PatientOptionName>
                              <PatientOptionId>
                                {patient.patientId}
                              </PatientOptionId>
                            </PatientOptionInfo>
                            <PatientOptionStats>
                              {patient.totalServices} services
                            </PatientOptionStats>
                          </PatientOption>
                        ))}
                        {filteredPatients.length === 0 && (
                          <NoPatients>No patients found</NoPatients>
                        )}
                      </PatientDropdown>
                    </PatientSearchContainer>
                  </FormGroup>
                )}

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
                    <Select
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value as any)}
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="Excel">Excel Spreadsheet</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label>Date Range</Label>
                    <DateRangeInputs>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                      />
                      <DateRangeSeparator>to</DateRangeSeparator>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                      />
                    </DateRangeInputs>
                  </FormGroup>
                </FormRow>

                <GenerateButtonContainer>
                  <GenerateButton
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    <FiPlay size={16} />
                    {isGenerating ? "Generating Report..." : "Generate Report"}
                  </GenerateButton>
                </GenerateButtonContainer>
              </ConfigForm>
            </ReportConfiguration>
          )}
        </ReportGeneratorSection>

        <RecentReportsSection>
          <SectionTitle>Recent Reports</SectionTitle>

          <ReportsList>
            {recentReports.map((report) => (
              <ReportCard key={report.id}>
                <ReportCardHeader>
                  <ReportInfo>
                    <ReportName>{report.name}</ReportName>
                    <ReportMeta>
                      <ReportDate>
                        Created: {formatDateTime(report.createdAt)}
                      </ReportDate>
                    </ReportMeta>
                  </ReportInfo>

                  <ReportStatus
                    status={report.status}
                    color={getStatusColor(report.status)}
                    background={getStatusBackground(report.status)}
                  >
                    {report.status === "generating" && report.progress && (
                      <ProgressBar>
                        <ProgressFill width={report.progress} />
                        <ProgressText>{report.progress}%</ProgressText>
                      </ProgressBar>
                    )}
                    {report.status !== "generating" && report.status}
                    {report.status === "failed" && report.error && (
                      <ErrorTooltip title={report.error}>ⓘ</ErrorTooltip>
                    )}
                  </ReportStatus>
                </ReportCardHeader>

                <ReportCardFooter>
                  <ReportDetails>
                    {report.fileSize && (
                      <FileSize>Size: {report.fileSize}</FileSize>
                    )}
                    {report.completedAt && (
                      <CompletedTime>
                        Completed: {formatDateTime(report.completedAt)}
                      </CompletedTime>
                    )}
                  </ReportDetails>

                  <ReportActions>
                    {report.status === "completed" && report.downloadUrl && (
                      <ActionButton
                        variant="download"
                        onClick={() =>
                          handleDownloadReport(
                            report.id,
                            report.downloadUrl!,
                            report.name
                          )
                        }
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
              <EmptyMessage>
                Generate your first report using the form on the left.
              </EmptyMessage>
            </EmptyReports>
          )}
        </RecentReportsSection>
      </MainContent>

      {isGenerating && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Generating report...</LoadingText>
          <LoadingSubtext>This may take a few minutes</LoadingSubtext>
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
  border: 2px solid
    ${(props) => (props.selected ? theme.colors.primary : "#e5e7eb")};
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
  margin-bottom: 16px;
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

const PatientSearchContainer = styled.div`
  position: relative;
`;

const PatientSearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px 6px 0 0;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const PatientDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PatientOption = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  background: ${(props) =>
    props.selected ? theme.colors.primary + "15" : "white"};
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;

  &:hover {
    background: ${theme.colors.primary}15;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const PatientOptionInfo = styled.div``;

const PatientOptionName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const PatientOptionId = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const PatientOptionStats = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const NoPatients = styled.div`
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
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

const ReportStatus = styled.div<{
  status: string;
  color: string;
  background: string;
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${(props) => props.background};
  color: ${(props) => props.color};
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
  width: ${(props) => props.width}%;
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

const ActionButton = styled.button<{ variant?: "download" | "delete" }>`
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

  ${(props) => {
    if (props.variant === "download") {
      return `
        background: #dbeafe;
        color: #1e40af;
        &:hover {
          background: #bfdbfe;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === "delete") {
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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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

export default DoctorServiceReports;
