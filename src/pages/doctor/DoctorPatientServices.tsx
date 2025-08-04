import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiCalendar,
  FiUser,
  FiClock,
  FiDollarSign,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";
import Swal from "sweetalert2";

// Mock data for doctor's patients and available services
const mockPatients = [
  {
    _id: "p1",
    name: "John Smith",
    patientId: "PAT-001",
    email: "john.smith@email.com",
    phone: "+91 9876543210",
    lastVisit: "2024-02-10T10:00:00Z",
    totalServices: 3,
    pendingServices: 1,
    nextAppointment: "2024-02-20T14:00:00Z",
    servicesHistory: [
      {
        _id: "s1",
        service: { name: "General Consultation", price: 150, duration: 30 },
        date: "2024-02-10T10:00:00Z",
        status: "completed",
        notes: "Regular check-up completed",
      },
      {
        _id: "s2",
        service: { name: "Teeth Cleaning", price: 80, duration: 45 },
        date: "2024-02-20T14:00:00Z",
        status: "scheduled",
        notes: "Deep cleaning requested",
      },
    ],
  },
  {
    _id: "p2",
    name: "Emily Davis",
    patientId: "PAT-002",
    email: "emily.davis@email.com",
    phone: "+91 9876543211",
    lastVisit: "2024-02-12T16:00:00Z",
    totalServices: 2,
    pendingServices: 0,
    nextAppointment: null,
    servicesHistory: [
      {
        _id: "s3",
        service: { name: "Root Canal Treatment", price: 500, duration: 90 },
        date: "2024-02-12T16:00:00Z",
        status: "completed",
        notes: "Single session root canal completed successfully",
      },
    ],
  },
  {
    _id: "p3",
    name: "Michael Johnson",
    patientId: "PAT-003",
    email: "michael.johnson@email.com",
    phone: "+91 9876543212",
    lastVisit: "2024-01-25T11:00:00Z",
    totalServices: 1,
    pendingServices: 2,
    nextAppointment: "2024-02-18T09:00:00Z",
    servicesHistory: [
      {
        _id: "s4",
        service: { name: "Dental Consultation", price: 150, duration: 30 },
        date: "2024-01-25T11:00:00Z",
        status: "completed",
        notes: "Initial consultation completed",
      },
      {
        _id: "s5",
        service: { name: "Teeth Whitening", price: 200, duration: 60 },
        date: "2024-02-18T09:00:00Z",
        status: "scheduled",
        notes: "Patient requested cosmetic whitening",
      },
    ],
  },
];

const availableServices = [
  {
    _id: "srv1",
    name: "General Consultation",
    category: "General Dentistry",
    price: 150,
    duration: 30,
  },
  {
    _id: "srv2",
    name: "Teeth Cleaning",
    category: "General Dentistry",
    price: 80,
    duration: 45,
  },
  {
    _id: "srv3",
    name: "Root Canal Treatment",
    category: "Specialized Services",
    price: 500,
    duration: 90,
  },
  {
    _id: "srv4",
    name: "Teeth Whitening",
    category: "Cosmetic Dentistry",
    price: 200,
    duration: 60,
  },
  {
    _id: "srv5",
    name: "Dental Filling",
    category: "General Dentistry",
    price: 120,
    duration: 45,
  },
  {
    _id: "srv6",
    name: "Tooth Extraction",
    category: "Oral Surgery",
    price: 300,
    duration: 30,
  },
];

const DoctorPatientServices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

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

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleAssignService = (patient: any) => {
    setSelectedPatient(patient);
    setShowAssignModal(true);
    // Set default appointment date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split("T")[0]);
  };

  const handleServiceAssignment = async () => {
    if (!selectedService || !appointmentDate || !appointmentTime) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill in all required fields.",
        icon: "warning",
      });
      return;
    }

    setIsAssigning(true);

    try {
      const service = availableServices.find((s) => s._id === selectedService);

      const assignmentData = {
        patientId: selectedPatient._id,
        serviceId: selectedService,
        appointmentDateTime: `${appointmentDate}T${appointmentTime}:00.000Z`,
        notes: serviceNotes,
        assignedBy: "current-doctor-id", // Replace with actual doctor ID
      };

      // TODO: Implement service assignment API call
      console.log("Assigning service:", assignmentData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Swal.fire({
        title: "Service Assigned!",
        text: `${service?.name} has been assigned to ${
          selectedPatient.name
        } for ${formatDateTime(assignmentData.appointmentDateTime)}.`,
        icon: "success",
        timer: 3000,
        showConfirmButton: true,
      });

      // Reset form and close modal
      setShowAssignModal(false);
      setSelectedService("");
      setAppointmentDate("");
      setAppointmentTime("");
      setServiceNotes("");
    } catch (error) {
      console.error("Error assigning service:", error);
      Swal.fire({
        title: "Assignment Failed",
        text: "Failed to assign service. Please try again.",
        icon: "error",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleViewPatientDetails = (patientId: string) => {
    // Navigate to patient details or history
    navigate(`/doctor/patients/${patientId}`);
  };

  const handleEditService = (serviceId: string) => {
    // Navigate to edit service assignment
    navigate(`/doctor/services/edit/${serviceId}`);
  };

  const handleCloseModal = () => {
    if (selectedService || serviceNotes) {
      Swal.fire({
        title: "Discard Changes?",
        text: "You have unsaved changes. Are you sure you want to close?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, discard changes",
      }).then((result) => {
        if (result.isConfirmed) {
          setShowAssignModal(false);
          setSelectedService("");
          setAppointmentDate("");
          setAppointmentTime("");
          setServiceNotes("");
        }
      });
    } else {
      setShowAssignModal(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <MdMedicalServices size={28} />
            Patient Services Management
          </Title>
          <Subtitle>
            Assign services to your patients and track treatment progress
          </Subtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        <PatientsSection>
          <SectionHeader>
            <SectionTitle>My Patients ({filteredPatients.length})</SectionTitle>
            <SearchContainer>
              <FiSearch size={16} />
              <SearchInput
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </SectionHeader>

          <PatientsList>
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient._id}
                selected={selectedPatient?._id === patient._id}
                onClick={() => handlePatientSelect(patient)}
              >
                <PatientHeader>
                  <PatientAvatar>
                    {patient.name
                      .split(" ")
                      .map((n) => n.charAt(0))
                      .join("")}
                  </PatientAvatar>
                  <PatientInfo>
                    <PatientName>{patient.name}</PatientName>
                    <PatientId>{patient.patientId}</PatientId>
                    <PatientContact>{patient.email}</PatientContact>
                  </PatientInfo>
                  <PatientActions>
                    <ActionButton
                      variant="assign"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignService(patient);
                      }}
                    >
                      <FiPlus size={14} />
                      Assign Service
                    </ActionButton>
                  </PatientActions>
                </PatientHeader>

                <PatientStats>
                  <StatItem>
                    <StatIcon>
                      <FiUser size={14} />
                    </StatIcon>
                    <StatText>
                      <StatValue>{patient.totalServices}</StatValue>
                      <StatLabel>Total Services</StatLabel>
                    </StatText>
                  </StatItem>
                  <StatItem>
                    <StatIcon>
                      <FiClock size={14} />
                    </StatIcon>
                    <StatText>
                      <StatValue>{patient.pendingServices}</StatValue>
                      <StatLabel>Pending</StatLabel>
                    </StatText>
                  </StatItem>
                  <StatItem>
                    <StatIcon>
                      <FiCalendar size={14} />
                    </StatIcon>
                    <StatText>
                      <StatValue>
                        {patient.lastVisit
                          ? formatDate(patient.lastVisit)
                          : "Never"}
                      </StatValue>
                      <StatLabel>Last Visit</StatLabel>
                    </StatText>
                  </StatItem>
                </PatientStats>

                {patient.nextAppointment && (
                  <NextAppointment>
                    <FiCalendar size={12} />
                    Next: {formatDateTime(patient.nextAppointment)}
                  </NextAppointment>
                )}
              </PatientCard>
            ))}
          </PatientsList>

          {filteredPatients.length === 0 && (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyTitle>No patients found</EmptyTitle>
              <EmptyMessage>
                {searchTerm
                  ? "No patients match your search criteria."
                  : "You don't have any patients assigned yet."}
              </EmptyMessage>
            </EmptyState>
          )}
        </PatientsSection>

        <ServicesSection>
          {selectedPatient ? (
            <>
              <SectionHeader>
                <SectionTitle>Services for {selectedPatient.name}</SectionTitle>
                <ActionButton
                  onClick={() => handleAssignService(selectedPatient)}
                >
                  <FiPlus size={16} />
                  Assign New Service
                </ActionButton>
              </SectionHeader>

              <ServicesList>
                {selectedPatient.servicesHistory.map((serviceRecord: any) => (
                  <ServiceCard key={serviceRecord._id}>
                    <ServiceHeader>
                      <ServiceInfo>
                        <ServiceName>{serviceRecord.service.name}</ServiceName>
                        <ServiceMeta>
                          <ServiceDate>
                            <FiCalendar size={12} />
                            {formatDateTime(serviceRecord.date)}
                          </ServiceDate>
                          <ServiceDuration>
                            <FiClock size={12} />
                            {serviceRecord.service.duration} mins
                          </ServiceDuration>
                          <ServiceCost>
                            <FiDollarSign size={12} />₹
                            {serviceRecord.service.price}
                          </ServiceCost>
                        </ServiceMeta>
                      </ServiceInfo>
                      <ServiceStatus status={serviceRecord.status}>
                        {serviceRecord.status === "completed" && (
                          <FiCheck size={12} />
                        )}
                        {serviceRecord.status === "scheduled" && (
                          <FiClock size={12} />
                        )}
                        {serviceRecord.status}
                      </ServiceStatus>
                    </ServiceHeader>

                    {serviceRecord.notes && (
                      <ServiceNotes>{serviceRecord.notes}</ServiceNotes>
                    )}

                    <ServiceActions>
                      <ActionButton
                        variant="view"
                        onClick={() =>
                          handleViewPatientDetails(selectedPatient._id)
                        }
                      >
                        <FiEye size={14} />
                        View Details
                      </ActionButton>
                      {serviceRecord.status === "scheduled" && (
                        <ActionButton
                          variant="edit"
                          onClick={() => handleEditService(serviceRecord._id)}
                        >
                          <FiEdit2 size={14} />
                          Edit
                        </ActionButton>
                      )}
                    </ServiceActions>
                  </ServiceCard>
                ))}
              </ServicesList>

              {selectedPatient.servicesHistory.length === 0 && (
                <EmptyServices>
                  <EmptyIcon>🩺</EmptyIcon>
                  <EmptyTitle>No services assigned</EmptyTitle>
                  <EmptyMessage>
                    This patient hasn't been assigned any services yet.
                  </EmptyMessage>
                  <ActionButton
                    onClick={() => handleAssignService(selectedPatient)}
                  >
                    <FiPlus size={16} />
                    Assign First Service
                  </ActionButton>
                </EmptyServices>
              )}
            </>
          ) : (
            <SelectPatientPrompt>
              <PromptIcon>👆</PromptIcon>
              <PromptTitle>Select a Patient</PromptTitle>
              <PromptMessage>
                Choose a patient from the list to view and manage their services
              </PromptMessage>
            </SelectPatientPrompt>
          )}
        </ServicesSection>
      </MainContent>

      {/* Service Assignment Modal */}
      {showAssignModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <MdMedicalServices size={20} />
                Assign Service to {selectedPatient?.name}
              </ModalTitle>
              <ModalCloseButton onClick={handleCloseModal}>
                <FiX size={20} />
              </ModalCloseButton>
            </ModalHeader>

            <ModalContent>
              <FormGroup>
                <Label>Select Service *</Label>
                <Select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="">Choose a service</option>
                  {availableServices.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name} - ₹{service.price} ({service.duration}{" "}
                      mins)
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Appointment Date *</Label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Appointment Time *</Label>
                  <Input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Add any notes about this service assignment..."
                  rows={3}
                />
              </FormGroup>

              {selectedService && (
                <ServicePreview>
                  {(() => {
                    const service = availableServices.find(
                      (s) => s._id === selectedService
                    );
                    return service ? (
                      <>
                        <PreviewTitle>Service Details</PreviewTitle>
                        <PreviewDetails>
                          <PreviewItem>
                            <span>Service:</span>
                            <span>{service.name}</span>
                          </PreviewItem>
                          <PreviewItem>
                            <span>Category:</span>
                            <span>{service.category}</span>
                          </PreviewItem>
                          <PreviewItem>
                            <span>Duration:</span>
                            <span>{service.duration} minutes</span>
                          </PreviewItem>
                          <PreviewItem>
                            <span>Cost:</span>
                            <span>₹{service.price}</span>
                          </PreviewItem>
                          {appointmentDate && appointmentTime && (
                            <PreviewItem>
                              <span>Scheduled:</span>
                              <span>
                                {formatDateTime(
                                  `${appointmentDate}T${appointmentTime}:00.000Z`
                                )}
                              </span>
                            </PreviewItem>
                          )}
                        </PreviewDetails>
                      </>
                    ) : null;
                  })()}
                </ServicePreview>
              )}
            </ModalContent>

            <ModalFooter>
              <ActionButton
                variant="secondary"
                onClick={handleCloseModal}
                disabled={isAssigning}
              >
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleServiceAssignment}
                disabled={isAssigning}
              >
                {isAssigning ? "Assigning..." : "Assign Service"}
              </ActionButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {isAssigning && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Assigning service...</LoadingText>
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
  grid-template-columns: 400px 1fr;
  height: 600px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const PatientsSection = styled.div`
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 400px;
  }
`;

const ServicesSection = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    color: #6b7280;
    z-index: 1;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PatientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PatientCard = styled.div<{ selected: boolean }>`
  background: white;
  border: 2px solid
    ${(props) => (props.selected ? theme.colors.primary : "#e5e7eb")};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
  font-size: 15px;
`;

const PatientId = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const PatientContact = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const PatientActions = styled.div``;

const ActionButton = styled.button<{
  variant?: "assign" | "view" | "edit" | "secondary";
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${(props) => (props.variant === "assign" ? "6px 12px" : "4px 8px")};
  border: none;
  border-radius: 4px;
  font-size: ${(props) => (props.variant === "assign" ? "12px" : "11px")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    if (props.variant === "assign") {
      return `
        background: ${theme.colors.primary};
        color: white;
        &:hover:not(:disabled) {
          background: ${theme.colors.primary}dd;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === "view") {
      return `
        background: #e0f2fe;
        color: #0369a1;
        &:hover:not(:disabled) {
          background: #b3e5fc;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === "edit") {
      return `
        background: #f0f9ff;
        color: #0284c7;
        &:hover:not(:disabled) {
          background: #e0f7fa;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === "secondary") {
      return `
        background: #e5e7eb;
        color: #374151;
        &:hover:not(:disabled) {
          background: #d1d5db;
        }
      `;
    } else {
      return `
        background: ${theme.colors.primary};
        color: white;
        &:hover:not(:disabled) {
          background: ${theme.colors.primary}dd;
          transform: translateY(-1px);
        }
      `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PatientStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatIcon = styled.div`
  color: ${theme.colors.primary};
`;

const StatText = styled.div``;

const StatValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #6b7280;
`;

const NextAppointment = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #059669;
  background: #d1fae5;
  padding: 4px 8px;
  border-radius: 4px;
  width: fit-content;
`;

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ServiceCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px 0;
`;

const ServiceMeta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ServiceDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const ServiceDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const ServiceCost = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #059669;
  font-weight: 500;
`;

const ServiceStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#d1fae5";
      case "scheduled":
        return "#dbeafe";
      case "cancelled":
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#065f46";
      case "scheduled":
        return "#1e40af";
      case "cancelled":
        return "#991b1b";
      default:
        return "#374151";
    }
  }};
`;

const ServiceNotes = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 12px;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 4px;
`;

const ServiceActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyServices = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
`;

const SelectPatientPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  height: 100%;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const PromptIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.4;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const PromptTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 300px;
  line-height: 1.5;
`;

const PromptMessage = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ServicePreview = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  margin-top: 16px;
`;

const PreviewTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
`;

const PreviewDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;

  span:first-child {
    color: #6b7280;
    font-weight: 500;
  }

  span:last-child {
    color: #111827;
    font-weight: 600;
  }
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
  z-index: 1100;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

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
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
`;

export default DoctorPatientServices;
