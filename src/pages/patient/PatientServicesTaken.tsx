import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiDollarSign, FiFileText, FiDownload, FiFilter, FiSearch, FiStar, FiCheck, FiX } from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from '@/config/route-paths.config';
import { theme } from '@/config/theme.config';
import Swal from "sweetalert2";

// Mock data for patient's service history
const mockPatientServices = [
  {
    _id: "ps1",
    service: {
      _id: "s1",
      name: "General Consultation",
      category: "General Dentistry",
      description: "Comprehensive dental examination and health assessment"
    },
    doctor: {
      _id: "d1",
      name: "Dr. Sarah Johnson",
      specialization: "General Dentistry",
      avatar: "SJ"
    },
    appointmentDate: "2024-02-15T10:00:00Z",
    completedDate: "2024-02-15T10:30:00Z",
    duration: 30,
    cost: 150,
    status: "completed",
    paymentStatus: "paid",
    rating: 5,
    feedback: "Excellent service! Dr. Johnson was very thorough and professional.",
    notes: "Regular check-up completed. No major issues found. Recommended follow-up in 6 months.",
    nextAppointment: "2024-08-15T10:00:00Z",
    prescription: {
      medications: ["Fluoride Toothpaste"],
      instructions: ["Brush twice daily", "Use fluoride mouthwash"]
    }
  },
  {
    _id: "ps2",
    service: {
      _id: "s2",
      name: "Teeth Cleaning",
      category: "General Dentistry", 
      description: "Professional dental cleaning and polishing"
    },
    doctor: {
      _id: "d2",
      name: "Dr. Michael Brown",
      specialization: "Dental Hygienist",
      avatar: "MB"
    },
    appointmentDate: "2024-01-20T14:00:00Z",
    completedDate: "2024-01-20T14:45:00Z",
    duration: 45,
    cost: 80,
    status: "completed",
    paymentStatus: "paid",
    rating: 4,
    feedback: "Good cleaning service. Staff was friendly and professional.",
    notes: "Deep cleaning completed. Some plaque buildup removed. Gums are healthy.",
    nextAppointment: null,
    prescription: {
      medications: [],
      instructions: ["Continue regular brushing", "Schedule next cleaning in 6 months"]
    }
  },
  {
    _id: "ps3",
    service: {
      _id: "s3", 
      name: "Root Canal Treatment",
      category: "Specialized Dental Services",
      description: "Endodontic treatment for infected tooth"
    },
    doctor: {
      _id: "d3",
      name: "Dr. Lisa Wilson", 
      specialization: "Endodontist",
      avatar: "LW"
    },
    appointmentDate: "2024-01-10T16:00:00Z",
    completedDate: "2024-01-10T17:30:00Z",
    duration: 90,
    cost: 500,
    status: "completed",
    paymentStatus: "paid",
    rating: 5,
    feedback: "Dr. Wilson made the procedure completely painless. Highly recommend!",
    notes: "Root canal treatment completed successfully. Crown placement scheduled.",
    nextAppointment: "2024-02-10T16:00:00Z",
    prescription: {
      medications: ["Ibuprofen 400mg", "Amoxicillin 500mg"],
      instructions: ["Take pain medication as needed", "Complete antibiotic course", "Avoid chewing on treated side"]
    }
  },
  {
    _id: "ps4",
    service: {
      _id: "s4",
      name: "Dental Filling",
      category: "General Dentistry",
      description: "Tooth-colored composite filling"
    },
    doctor: {
      _id: "d1",
      name: "Dr. Sarah Johnson",
      specialization: "General Dentistry", 
      avatar: "SJ"
    },
    appointmentDate: "2023-12-05T11:00:00Z",
    completedDate: "2023-12-05T11:45:00Z",
    duration: 45,
    cost: 120,
    status: "completed",
    paymentStatus: "paid",
    rating: 4,
    feedback: "Quick and efficient service. Filling looks natural.",
    notes: "Composite filling placed on upper left molar. No complications.",
    nextAppointment: null,
    prescription: {
      medications: [],
      instructions: ["Avoid hard foods for 24 hours", "Normal brushing after numbness wears off"]
    }
  }
];

const PatientServicesTaken = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'upcoming'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'cost'>('date');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = (service: any) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleDownloadReport = () => {
    navigate(ROUTES.PATIENT.SERVICES_REPORT);
  };

  const handleViewAvailableServices = () => {
    navigate(ROUTES.PATIENT.AVAILABLE_SERVICES);
  };

  const handleBookFollowUp = (service: any) => {
    Swal.fire({
      title: 'Book Follow-up Appointment',
      text: `Would you like to book a follow-up appointment for ${service.service.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: theme.colors.primary,
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, book appointment'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Navigate to booking system
        Swal.fire({
          title: 'Redirecting...',
          text: 'Taking you to the appointment booking system.',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} filled={index < rating}>
        <FiStar size={12} />
      </Star>
    ));
  };

  // Filter and sort services
  const filteredAndSortedServices = mockPatientServices
    .filter(serviceRecord => {
      const matchesSearch = 
        serviceRecord.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceRecord.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceRecord.service.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' && serviceRecord.status === 'completed') ||
        (filterStatus === 'upcoming' && serviceRecord.nextAppointment);
      
      const matchesCategory = filterCategory === 'all' || serviceRecord.service.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'cost':
          return b.cost - a.cost;
        default:
          return 0;
      }
    });

  // Calculate summary statistics
  const summaryStats = {
    total: mockPatientServices.length,
    totalCost: mockPatientServices.reduce((sum, s) => sum + s.cost, 0),
    averageRating: mockPatientServices.reduce((sum, s) => sum + s.rating, 0) / mockPatientServices.length,
    upcomingAppointments: mockPatientServices.filter(s => s.nextAppointment).length
  };

  const categories = [...new Set(mockPatientServices.map(s => s.service.category))];

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <MdMedicalServices size={28} />
            My Service History
            <TotalCount>({summaryStats.total} services)</TotalCount>
          </Title>
          <Subtitle>View and manage your dental service history and upcoming appointments</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton variant="secondary" onClick={handleDownloadReport}>
            <FiDownload size={16} />
            Download Report
          </ActionButton>
          <ActionButton onClick={handleViewAvailableServices}>
            <FiFileText size={16} />
            Browse Services
          </ActionButton>
        </HeaderActions>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryIcon>
            <MdMedicalServices size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.total}</SummaryValue>
            <SummaryLabel>Services Completed</SummaryLabel>
            <SummarySubtext>Total treatments received</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiDollarSign size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{formatCurrency(summaryStats.totalCost)}</SummaryValue>
            <SummaryLabel>Total Investment</SummaryLabel>
            <SummarySubtext>Amount spent on dental care</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiStar size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.averageRating.toFixed(1)} ⭐</SummaryValue>
            <SummaryLabel>Average Rating</SummaryLabel>
            <SummarySubtext>Your satisfaction score</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiCalendar size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.upcomingAppointments}</SummaryValue>
            <SummaryLabel>Upcoming</SummaryLabel>
            <SummarySubtext>Scheduled follow-ups</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <Controls>
        <SearchAndFilter>
          <SearchInputContainer>
            <FiSearch size={16} />
            <SearchInput
              type="text"
              placeholder="Search services, doctors, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputContainer>
          
          <FilterSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Services</option>
            <option value="completed">Completed</option>
            <option value="upcoming">With Follow-ups</option>
          </FilterSelect>
          
          <FilterSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </FilterSelect>
          
          <SortSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="cost">Sort by Cost</option>
          </SortSelect>
        </SearchAndFilter>
        
        <ResultsInfo>
          Showing {filteredAndSortedServices.length} of {summaryStats.total} services
        </ResultsInfo>
      </Controls>

      <ServicesList>
        {filteredAndSortedServices.map(serviceRecord => (
          <ServiceCard key={serviceRecord._id}>
            <ServiceHeader>
              <ServiceInfo>
                <ServiceName>{serviceRecord.service.name}</ServiceName>
                <ServiceMeta>
                  <ServiceDate>
                    <FiCalendar size={12} />
                    {formatDateTime(serviceRecord.appointmentDate)}
                  </ServiceDate>
                  <ServiceCategory>{serviceRecord.service.category}</ServiceCategory>
                  <ServiceDuration>
                    <FiClock size={12} />
                    {serviceRecord.duration} mins
                  </ServiceDuration>
                </ServiceMeta>
              </ServiceInfo>
              
              <ServiceCost>{formatCurrency(serviceRecord.cost)}</ServiceCost>
            </ServiceHeader>

            <DoctorInfo>
              <DoctorAvatar>{serviceRecord.doctor.avatar}</DoctorAvatar>
              <DoctorDetails>
                <DoctorName>{serviceRecord.doctor.name}</DoctorName>
                <DoctorSpecialization>{serviceRecord.doctor.specialization}</DoctorSpecialization>
              </DoctorDetails>
              
              <ServiceStatus status={serviceRecord.status}>
                <FiCheck size={12} />
                {serviceRecord.status}
              </ServiceStatus>
            </DoctorInfo>

            <ServiceDescription>{serviceRecord.service.description}</ServiceDescription>

            <ServiceRating>
              <RatingStars>
                {renderStars(serviceRecord.rating)}
              </RatingStars>
              <RatingText>Your Rating: {serviceRecord.rating}/5</RatingText>
            </ServiceRating>

            {serviceRecord.feedback && (
              <ServiceFeedback>
                <FeedbackIcon>💬</FeedbackIcon>
                <FeedbackText>"{serviceRecord.feedback}"</FeedbackText>
              </ServiceFeedback>
            )}

            {serviceRecord.nextAppointment && (
              <NextAppointment>
                <AppointmentIcon>📅</AppointmentIcon>
                <AppointmentText>
                  Next follow-up: {formatDateTime(serviceRecord.nextAppointment)}
                </AppointmentText>
              </NextAppointment>
            )}

            <ServiceActions>
              <ActionButton variant="details" onClick={() => handleViewDetails(serviceRecord)}>
                <FiFileText size={14} />
                View Details
              </ActionButton>
              
              {serviceRecord.nextAppointment && (
                <ActionButton variant="secondary" onClick={() => handleBookFollowUp(serviceRecord)}>
                  <FiCalendar size={14} />
                  Reschedule
                </ActionButton>
              )}
              
              <PaymentStatus status={serviceRecord.paymentStatus}>
                <FiDollarSign size={12} />
                {serviceRecord.paymentStatus}
              </PaymentStatus>
            </ServiceActions>
          </ServiceCard>
        ))}
      </ServicesList>

      {filteredAndSortedServices.length === 0 && (
        <EmptyState>
          <EmptyIcon>🩺</EmptyIcon>
          <EmptyTitle>No services found</EmptyTitle>
          <EmptyMessage>
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? "No services match your current filters. Try adjusting your search criteria."
              : "You haven't received any dental services yet. Browse available services to get started."
            }
          </EmptyMessage>
          {(!searchTerm && filterStatus === 'all' && filterCategory === 'all') && (
            <ActionButton onClick={handleViewAvailableServices}>
              <FiFileText size={16} />
              Browse Available Services
            </ActionButton>
          )}
        </EmptyState>
      )}

      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <ModalOverlay onClick={() => setShowDetailsModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <MdMedicalServices size={20} />
                {selectedService.service.name} - Service Details
              </ModalTitle>
              <ModalCloseButton onClick={() => setShowDetailsModal(false)}>
                <FiX size={20} />
              </ModalCloseButton>
            </ModalHeader>

            <ModalContent>
              <ServiceOverview>
                <OverviewGrid>
                  <OverviewItem>
                    <OverviewLabel>Treatment Date</OverviewLabel>
                    <OverviewValue>{formatDateTime(selectedService.appointmentDate)}</OverviewValue>
                  </OverviewItem>
                  <OverviewItem>
                    <OverviewLabel>Duration</OverviewLabel>
                    <OverviewValue>{selectedService.duration} minutes</OverviewValue>
                  </OverviewItem>
                  <OverviewItem>
                    <OverviewLabel>Cost</OverviewLabel>
                    <OverviewValue>{formatCurrency(selectedService.cost)}</OverviewValue>
                  </OverviewItem>
                  <OverviewItem>
                    <OverviewLabel>Payment Status</OverviewLabel>
                    <PaymentStatus status={selectedService.paymentStatus}>
                      {selectedService.paymentStatus}
                    </PaymentStatus>
                  </OverviewItem>
                </OverviewGrid>
              </ServiceOverview>

              <DoctorSection>
                <SectionTitle>Treating Doctor</SectionTitle>
                <DoctorCard>
                  <DoctorAvatar large>{selectedService.doctor.avatar}</DoctorAvatar>
                  <DoctorCardInfo>
                    <DoctorName>{selectedService.doctor.name}</DoctorName>
                    <DoctorSpecialization>{selectedService.doctor.specialization}</DoctorSpecialization>
                  </DoctorCardInfo>
                </DoctorCard>
              </DoctorSection>

              {selectedService.notes && (
                <NotesSection>
                  <SectionTitle>Doctor's Notes</SectionTitle>
                  <NotesText>{selectedService.notes}</NotesText>
                </NotesSection>
              )}

              {selectedService.prescription && (selectedService.prescription.medications.length > 0 || selectedService.prescription.instructions.length > 0) && (
                <PrescriptionSection>
                  <SectionTitle>Prescription & Instructions</SectionTitle>
                  
                  {selectedService.prescription.medications.length > 0 && (
                    <PrescriptionGroup>
                      <PrescriptionTitle>Medications</PrescriptionTitle>
                      <MedicationList>
                        {selectedService.prescription.medications.map((medication: string, index: number) => (
                          <MedicationItem key={index}>
                            <MedicationIcon>💊</MedicationIcon>
                            {medication}
                          </MedicationItem>
                        ))}
                      </MedicationList>
                    </PrescriptionGroup>
                  )}
                  
                  {selectedService.prescription.instructions.length > 0 && (
                    <PrescriptionGroup>
                      <PrescriptionTitle>Care Instructions</PrescriptionTitle>
                      <InstructionList>
                        {selectedService.prescription.instructions.map((instruction: string, index: number) => (
                          <InstructionItem key={index}>
                            <InstructionIcon>📋</InstructionIcon>
                            {instruction}
                          </InstructionItem>
                        ))}
                      </InstructionList>
                    </PrescriptionGroup>
                  )}
                </PrescriptionSection>
              )}

              <RatingSection>
                <SectionTitle>Your Experience</SectionTitle>
                <RatingDisplay>
                  <RatingStars large>
                    {renderStars(selectedService.rating)}
                  </RatingStars>
                  <RatingText>You rated this service {selectedService.rating} out of 5 stars</RatingText>
                </RatingDisplay>
                {selectedService.feedback && (
                  <PatientFeedback>
                    <FeedbackTitle>Your Feedback</FeedbackTitle>
                    <FeedbackText>"{selectedService.feedback}"</FeedbackText>
                  </PatientFeedback>
                )}
              </RatingSection>

              {selectedService.nextAppointment && (
                <FollowUpSection>
                  <SectionTitle>Follow-up Appointment</SectionTitle>
                  <FollowUpCard>
                    <FollowUpIcon>📅</FollowUpIcon>
                    <FollowUpInfo>
                      <FollowUpDate>{formatDateTime(selectedService.nextAppointment)}</FollowUpDate>
                      <FollowUpText>Next appointment scheduled</FollowUpText>
                    </FollowUpInfo>
                    <ActionButton variant="secondary" onClick={() => handleBookFollowUp(selectedService)}>
                      <FiCalendar size={14} />
                      Reschedule
                    </ActionButton>
                  </FollowUpCard>
                </FollowUpSection>
              )}
            </ModalContent>

            <ModalFooter>
              <ActionButton variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </ActionButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, #6366f1 100%);
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
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

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button<{ variant?: 'secondary' | 'details' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props.variant === 'secondary') {
      return `
        background: rgba(255, 255, 255, 0.15);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
        }
      `;
    } else if (props.variant === 'details') {
      return `
        background: #f3f4f6;
        color: #374151;
        padding: 6px 12px;
        font-size: 12px;
        &:hover:not(:disabled) {
          background: #e5e7eb;
          transform: translateY(-1px);
        }
      `;
    } else {
      return `
        background: white;
        color: ${theme.colors.primary};
        &:hover:not(:disabled) {
          background: #f9fafb;
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

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const SummaryCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
`;

const SummarySubtext = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const Controls = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchAndFilter = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 400px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-width: auto;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
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
  width: 100%;
  padding: 10px 12px 10px 40px;
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

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 120px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const SortSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 140px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ResultsInfo = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
`;

const ServicesList = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ServiceCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ServiceInfo = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 6px 0;
`;

const ServiceMeta = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ServiceDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const ServiceCategory = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const ServiceDuration = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const ServiceCost = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #059669;
`;

const DoctorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const DoctorAvatar = styled.div<{ large?: boolean }>`
  width: ${props => props.large ? '50px' : '36px'};
  height: ${props => props.large ? '50px' : '36px'};
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.large ? '16px' : '12px'};
  font-weight: 600;
  flex-shrink: 0;
`;

const DoctorDetails = styled.div`
  flex: 1;
`;

const DoctorName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const DoctorSpecialization = styled.div`
  font-size: 12px;
  color: #6b7280;
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
  background: #d1fae5;
  color: #065f46;
`;

const ServiceDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 12px 0;
`;

const ServiceRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const RatingStars = styled.div<{ large?: boolean }>`
  display: flex;
  gap: 2px;
  
  svg {
    width: ${props => props.large ? '16px' : '12px'};
    height: ${props => props.large ? '16px' : '12px'};
  }
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#fbbf24' : '#d1d5db'};
  
  svg {
    fill: currentColor;
  }
`;

const RatingText = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const ServiceFeedback = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const FeedbackIcon = styled.span`
  font-size: 14px;
  flex-shrink: 0;
`;

const FeedbackText = styled.div`
  font-size: 13px;
  color: #374151;
  font-style: italic;
  line-height: 1.4;
`;

const NextAppointment = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #dbeafe;
  border-radius: 6px;
`;

const AppointmentIcon = styled.span`
  font-size: 14px;
`;

const AppointmentText = styled.div`
  font-size: 13px;
  color: #1e40af;
  font-weight: 500;
`;

const ServiceActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const PaymentStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => props.status === 'paid' ? '#d1fae5' : '#fef3c7'};
  color: ${props => props.status === 'paid' ? '#065f46' : '#92400e'};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
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
  max-width: 700px;
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

const ServiceOverview = styled.div`
  margin-bottom: 24px;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const OverviewItem = styled.div``;

const OverviewLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
`;

const OverviewValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const DoctorSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
`;

const DoctorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
`;

const DoctorCardInfo = styled.div``;

const NotesSection = styled.div`
  margin-bottom: 24px;
`;

const NotesText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid ${theme.colors.primary};
`;

const PrescriptionSection = styled.div`
  margin-bottom: 24px;
`;

const PrescriptionGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PrescriptionTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const MedicationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MedicationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 13px;
  color: #92400e;
`;

const MedicationIcon = styled.span`
  font-size: 14px;
`;

const InstructionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InstructionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border-radius: 6px;
  font-size: 13px;
  color: #166534;
  line-height: 1.4;
`;

const InstructionIcon = styled.span`
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const RatingSection = styled.div`
  margin-bottom: 24px;
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const PatientFeedback = styled.div`
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
`;

const FeedbackTitle = styled.h6`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const FollowUpSection = styled.div``;

const FollowUpCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #dbeafe;
  border-radius: 8px;
`;

const FollowUpIcon = styled.span`
  font-size: 20px;
`;

const FollowUpInfo = styled.div`
  flex: 1;
`;

const FollowUpDate = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 2px;
`;

const FollowUpText = styled.div`
  font-size: 12px;
  color: #3b82f6;
`;

export default PatientServicesTaken;