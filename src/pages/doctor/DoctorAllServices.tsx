import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiDollarSign, FiTag, FiInfo, FiPlus, FiEye } from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from '@/config/route-paths.config';
import { theme } from '@/config/theme.config';

// Mock data for available services
const mockServices = [
  {
    _id: "1",
    serviceId: "SRV-001",
    name: "General Consultation",
    description: "Comprehensive medical examination and consultation for overall dental health assessment",
    category: "General Dentistry",
    price: 150,
    duration: 30,
    isActive: true,
    prerequisites: ["Valid ID", "Insurance Card"],
    materials: ["Dental Mirror", "Probe", "Explorer"],
    instructions: {
      beforeTreatment: ["Brush teeth 2 hours before appointment", "Avoid eating 1 hour before"],
      afterTreatment: ["Follow prescribed medication", "Schedule follow-up if needed"]
    },
    statistics: {
      totalBookings: 456,
      completedBookings: 423,
      averageRating: 4.8,
      patientCount: 245
    }
  },
  {
    _id: "2",
    serviceId: "SRV-002", 
    name: "Teeth Cleaning",
    description: "Professional dental cleaning and polishing service to remove plaque and tartar",
    category: "General Dentistry",
    price: 80,
    duration: 45,
    isActive: true,
    prerequisites: ["Recent X-rays (if available)"],
    materials: ["Scaler", "Polishing Paste", "Fluoride Treatment"],
    instructions: {
      beforeTreatment: ["Inform about any sensitivity", "Complete medical history form"],
      afterTreatment: ["Wait 30 minutes before eating", "Use recommended toothpaste"]
    },
    statistics: {
      totalBookings: 312,
      completedBookings: 298,
      averageRating: 4.9,
      patientCount: 189
    }
  },
  {
    _id: "3",
    serviceId: "SRV-003",
    name: "Root Canal Treatment", 
    description: "Advanced endodontic treatment for infected or damaged teeth to preserve natural tooth",
    category: "Specialized Dental Services",
    price: 500,
    duration: 90,
    isActive: true,
    prerequisites: ["X-ray reports", "Pain assessment", "Medical clearance if required"],
    materials: ["Local Anesthesia", "Rotary Files", "Gutta Percha", "Dental Dam"],
    instructions: {
      beforeTreatment: ["Take prescribed antibiotics", "Eat light meal before procedure", "Arrange transportation"],
      afterTreatment: ["Take prescribed pain medication", "Avoid chewing on treated side", "Schedule crown placement"]
    },
    statistics: {
      totalBookings: 89,
      completedBookings: 82,
      averageRating: 4.7,
      patientCount: 67
    }
  },
  {
    _id: "4",
    serviceId: "SRV-004",
    name: "Teeth Whitening",
    description: "Professional cosmetic teeth whitening treatment for brighter, whiter smile",
    category: "Cosmetic Dentistry", 
    price: 200,
    duration: 60,
    isActive: true,
    prerequisites: ["Dental cleaning within 6 months", "No active cavities"],
    materials: ["Whitening Gel", "LED Light", "Protective Gel", "Desensitizing Agent"],
    instructions: {
      beforeTreatment: ["Avoid staining foods 24 hours before", "Complete dental cleaning if needed"],
      afterTreatment: ["Avoid coffee, tea, wine for 48 hours", "Use sensitivity toothpaste if needed"]
    },
    statistics: {
      totalBookings: 156,
      completedBookings: 142,
      averageRating: 4.6,
      patientCount: 98
    }
  },
  {
    _id: "5",
    serviceId: "SRV-005",
    name: "Dental Implant",
    description: "Complete dental implant procedure with titanium post and crown placement",
    category: "Oral Surgery",
    price: 1200,
    duration: 120,
    isActive: true,
    prerequisites: ["CT Scan", "Bone density assessment", "Medical clearance", "Smoking cessation"],
    materials: ["Titanium Implant", "Healing Abutment", "Surgical Kit", "Bone Graft (if needed)"],
    instructions: {
      beforeTreatment: ["Fast 8 hours before surgery", "Arrange transportation", "Take prescribed antibiotics"],
      afterTreatment: ["Apply ice packs", "Soft diet for 1 week", "No smoking for 2 weeks", "Return for suture removal"]
    },
    statistics: {
      totalBookings: 28,
      completedBookings: 25,
      averageRating: 4.9,
      patientCount: 23
    }
  },
  {
    _id: "6",
    serviceId: "SRV-006",
    name: "Dental Filling",
    description: "Tooth-colored composite filling for cavities and minor tooth damage restoration",
    category: "General Dentistry",
    price: 120,
    duration: 45,
    isActive: true,
    prerequisites: ["X-ray confirmation of cavity"],
    materials: ["Composite Resin", "Bonding Agent", "Dental Dam", "Curing Light"],
    instructions: {
      beforeTreatment: ["Inform about any allergies", "Light meal recommended"],
      afterTreatment: ["Avoid hard foods for 24 hours", "Normal brushing after numbness wears off"]
    },
    statistics: {
      totalBookings: 234,
      completedBookings: 221,
      averageRating: 4.7,
      patientCount: 156
    }
  }
];

const serviceCategories = [
  "General Dentistry",
  "Specialized Dental Services",
  "Cosmetic Dentistry", 
  "Oral Surgery",
  "Emergency Services",
  "Orthodontics",
  "Periodontics"
];

const DoctorAllServices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration' | 'popularity'>('name');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleAssignToPatient = (service: any) => {
    // Navigate to patient services with pre-selected service
    navigate(`${ROUTES.DOCTOR.PATIENT_SERVICES}?serviceId=${service._id}`);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'General Dentistry': { bg: '#dbeafe', text: '#1e40af' },
      'Specialized Dental Services': { bg: '#fef3c7', text: '#92400e' },
      'Cosmetic Dentistry': { bg: '#f3e8ff', text: '#7c3aed' },
      'Oral Surgery': { bg: '#fee2e2', text: '#dc2626' },
      'Emergency Services': { bg: '#ffedd5', text: '#ea580c' },
      'Orthodontics': { bg: '#d1fae5', text: '#059669' },
      'Periodontics': { bg: '#fce7f3', text: '#be185d' }
    };
    return colors[category] || { bg: '#f3f4f6', text: '#374151' };
  };

  // Filter and sort services
  const filteredAndSortedServices = mockServices
    .filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
      
      return matchesSearch && matchesCategory && service.isActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'duration':
          return a.duration - b.duration;
        case 'popularity':
          return b.statistics.totalBookings - a.statistics.totalBookings;
        default:
          return 0;
      }
    });

  // Calculate summary statistics
  const summaryStats = {
    total: filteredAndSortedServices.length,
    averagePrice: Math.round(filteredAndSortedServices.reduce((sum, s) => sum + s.price, 0) / filteredAndSortedServices.length),
    averageDuration: Math.round(filteredAndSortedServices.reduce((sum, s) => sum + s.duration, 0) / filteredAndSortedServices.length),
    totalBookings: filteredAndSortedServices.reduce((sum, s) => sum + s.statistics.totalBookings, 0)
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <MdMedicalServices size={28} />
            Available Services
            <TotalCount>({summaryStats.total} services)</TotalCount>
          </Title>
          <Subtitle>Browse all available dental services and their details</Subtitle>
        </HeaderContent>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryIcon>
            <MdMedicalServices size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.total}</SummaryValue>
            <SummaryLabel>Available Services</SummaryLabel>
            <SummarySubtext>Active services you can assign</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiDollarSign size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{formatCurrency(summaryStats.averagePrice)}</SummaryValue>
            <SummaryLabel>Average Price</SummaryLabel>
            <SummarySubtext>Across all services</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiClock size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.averageDuration}</SummaryValue>
            <SummaryLabel>Avg Duration (mins)</SummaryLabel>
            <SummarySubtext>Typical appointment time</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiTag size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.totalBookings}</SummaryValue>
            <SummaryLabel>Total Bookings</SummaryLabel>
            <SummarySubtext>Across all services</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <Controls>
        <SearchAndFilter>
          <SearchInputContainer>
            <FiSearch size={16} />
            <SearchInput
              type="text"
              placeholder="Search services by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInputContainer>
          
          <FilterSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {serviceCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </FilterSelect>
          
          <SortSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="duration">Sort by Duration</option>
            <option value="popularity">Sort by Popularity</option>
          </SortSelect>
        </SearchAndFilter>
        
        <ResultsInfo>
          Showing {filteredAndSortedServices.length} of {mockServices.filter(s => s.isActive).length} services
        </ResultsInfo>
      </Controls>

      <ServicesGrid>
        {filteredAndSortedServices.map(service => (
          <ServiceCard key={service._id}>
            <ServiceHeader>
              <ServiceIcon>
                <MdMedicalServices size={24} />
              </ServiceIcon>
              <ServiceMeta>
                <ServiceName>{service.name}</ServiceName>
                <ServiceId>{service.serviceId}</ServiceId>
              </ServiceMeta>
              <ServiceActions>
                <ActionButton variant="view" onClick={() => handleViewDetails(service)}>
                  <FiEye size={14} />
                </ActionButton>
                <ActionButton variant="assign" onClick={() => handleAssignToPatient(service)}>
                  <FiPlus size={14} />
                </ActionButton>
              </ServiceActions>
            </ServiceHeader>

            <CategoryBadge colors={getCategoryColor(service.category)}>
              {service.category}
            </CategoryBadge>

            <ServiceDescription>{service.description}</ServiceDescription>

            <ServiceDetails>
              <DetailItem>
                <DetailIcon><FiDollarSign size={14} /></DetailIcon>
                <DetailText>
                  <DetailValue>{formatCurrency(service.price)}</DetailValue>
                  <DetailLabel>Price</DetailLabel>
                </DetailText>
              </DetailItem>
              <DetailItem>
                <DetailIcon><FiClock size={14} /></DetailIcon>
                <DetailText>
                  <DetailValue>{service.duration} mins</DetailValue>
                  <DetailLabel>Duration</DetailLabel>
                </DetailText>
              </DetailItem>
            </ServiceDetails>

            <ServiceStats>
              <StatItem>
                <StatValue>{service.statistics.totalBookings}</StatValue>
                <StatLabel>Total Bookings</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{service.statistics.averageRating.toFixed(1)} ⭐</StatValue>
                <StatLabel>Rating</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{service.statistics.patientCount}</StatValue>
                <StatLabel>Patients</StatLabel>
              </StatItem>
            </ServiceStats>

            <ServiceFooter>
              <ActionButton variant="details" onClick={() => handleViewDetails(service)}>
                <FiInfo size={14} />
                View Details
              </ActionButton>
              <ActionButton onClick={() => handleAssignToPatient(service)}>
                <FiPlus size={14} />
                Assign to Patient
              </ActionButton>
            </ServiceFooter>
          </ServiceCard>
        ))}
      </ServicesGrid>

      {filteredAndSortedServices.length === 0 && (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No services found</EmptyTitle>
          <EmptyMessage>
            {searchTerm || filterCategory !== 'all'
              ? "No services match your current filters. Try adjusting your search criteria."
              : "No active services are available at the moment."
            }
          </EmptyMessage>
        </EmptyState>
      )}

      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <ModalOverlay onClick={() => setShowDetailsModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <MdMedicalServices size={20} />
                {selectedService.name}
              </ModalTitle>
              <ModalCloseButton onClick={() => setShowDetailsModal(false)}>
                ×
              </ModalCloseButton>
            </ModalHeader>

            <ModalContent>
              <ServiceOverview>
                <OverviewGrid>
                  <OverviewItem>
                    <OverviewLabel>Service ID</OverviewLabel>
                    <OverviewValue>{selectedService.serviceId}</OverviewValue>
                  </OverviewItem>
                  <OverviewItem>
                    <OverviewLabel>Category</OverviewLabel>
                    <CategoryBadge colors={getCategoryColor(selectedService.category)}>
                      {selectedService.category}
                    </CategoryBadge>
                  </OverviewItem>
                  <OverviewItem>
                    <OverviewLabel>Price</OverviewLabel>
                    <PriceTag>{formatCurrency(selectedService.price)}</PriceTag>
                  </OverviewItem>
                  <OverviewItem>
                    <OverviewLabel>Duration</OverviewLabel>
                    <DurationTag>
                      <FiClock size={12} />
                      {selectedService.duration} minutes
                    </DurationTag>
                  </OverviewItem>
                </OverviewGrid>

                <DescriptionSection>
                  <SectionTitle>Description</SectionTitle>
                  <Description>{selectedService.description}</Description>
                </DescriptionSection>
              </ServiceOverview>

              <DetailsSection>
                <DetailSection>
                  <SectionTitle>Prerequisites</SectionTitle>
                  {selectedService.prerequisites && selectedService.prerequisites.length > 0 ? (
                    <ItemList>
                      {selectedService.prerequisites.map((item: string, index: number) => (
                        <ListItem key={index}>• {item}</ListItem>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyText>No specific prerequisites</EmptyText>
                  )}
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Materials Required</SectionTitle>
                  {selectedService.materials && selectedService.materials.length > 0 ? (
                    <ItemList>
                      {selectedService.materials.map((material: string, index: number) => (
                        <ListItem key={index}>• {material}</ListItem>
                      ))}
                    </ItemList>
                  ) : (
                    <EmptyText>No specific materials listed</EmptyText>
                  )}
                </DetailSection>
              </DetailsSection>

              <InstructionsSection>
                <InstructionGroup>
                  <SectionTitle>Before Treatment</SectionTitle>
                  {selectedService.instructions?.beforeTreatment && selectedService.instructions.beforeTreatment.length > 0 ? (
                    <InstructionList>
                      {selectedService.instructions.beforeTreatment.map((instruction: string, index: number) => (
                        <InstructionItem key={index} type="before">
                          <InstructionIcon>📋</InstructionIcon>
                          {instruction}
                        </InstructionItem>
                      ))}
                    </InstructionList>
                  ) : (
                    <EmptyText>No specific pre-treatment instructions</EmptyText>
                  )}
                </InstructionGroup>

                <InstructionGroup>
                  <SectionTitle>After Treatment</SectionTitle>
                  {selectedService.instructions?.afterTreatment && selectedService.instructions.afterTreatment.length > 0 ? (
                    <InstructionList>
                      {selectedService.instructions.afterTreatment.map((instruction: string, index: number) => (
                        <InstructionItem key={index} type="after">
                          <InstructionIcon>✅</InstructionIcon>
                          {instruction}
                        </InstructionItem>
                      ))}
                    </InstructionList>
                  ) : (
                    <EmptyText>No specific post-treatment instructions</EmptyText>
                  )}
                </InstructionGroup>
              </InstructionsSection>

              <StatisticsSection>
                <SectionTitle>Service Statistics</SectionTitle>
                <StatsGrid>
                  <StatCard>
                    <StatCardValue>{selectedService.statistics.totalBookings}</StatCardValue>
                    <StatCardLabel>Total Bookings</StatCardLabel>
                  </StatCard>
                  <StatCard>
                    <StatCardValue>{selectedService.statistics.completedBookings}</StatCardValue>
                    <StatCardLabel>Completed</StatCardLabel>
                  </StatCard>
                  <StatCard>
                    <StatCardValue>{selectedService.statistics.averageRating.toFixed(1)} ⭐</StatCardValue>
                    <StatCardLabel>Average Rating</StatCardLabel>
                  </StatCard>
                  <StatCard>
                    <StatCardValue>{selectedService.statistics.patientCount}</StatCardValue>
                    <StatCardLabel>Unique Patients</StatCardLabel>
                  </StatCard>
                </StatsGrid>
              </StatisticsSection>
            </ModalContent>

            <ModalFooter>
              <ActionButton variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </ActionButton>
              <ActionButton onClick={() => {
                setShowDetailsModal(false);
                handleAssignToPatient(selectedService);
              }}>
                <FiPlus size={16} />
                Assign to Patient
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
  min-width: 140px;
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
  min-width: 160px;
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  padding: 24px;
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
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const ServiceIcon = styled.div`
  padding: 8px;
  border-radius: 8px;
  background: ${theme.colors.primary}15;
  color: ${theme.colors.primary};
  flex-shrink: 0;
`;

const ServiceMeta = styled.div`
  flex: 1;
`;

const ServiceName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
`;

const ServiceId = styled.div`
  font-size: 11px;
  color: #6b7280;
  font-family: monospace;
`;

const ServiceActions = styled.div`
  display: flex;
  gap: 6px;
`;

const ActionButton = styled.button<{ variant?: 'view' | 'assign' | 'details' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${props => props.variant === 'view' || props.variant === 'assign' ? '6px' : '8px 12px'};
  border: none;
  border-radius: 4px;
  font-size: ${props => props.variant === 'view' || props.variant === 'assign' ? '12px' : '13px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    if (props.variant === 'view') {
      return `
        background: #e0f2fe;
        color: #0369a1;
        width: 28px;
        height: 28px;
        justify-content: center;
        &:hover:not(:disabled) {
          background: #b3e5fc;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === 'assign') {
      return `
        background: ${theme.colors.primary};
        color: white;
        width: 28px;
        height: 28px;
        justify-content: center;
        &:hover:not(:disabled) {
          background: ${theme.colors.primary}dd;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === 'details') {
      return `
        background: #f3f4f6;
        color: #374151;
        &:hover:not(:disabled) {
          background: #e5e7eb;
          transform: translateY(-1px);
        }
      `;
    } else if (props.variant === 'secondary') {
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

const CategoryBadge = styled.div<{ colors: { bg: string; text: string } }>`
  display: inline-block;
  padding: 4px 8px;
  background: ${props => props.colors.bg};
  color: ${props => props.colors.text};
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
`;

const ServiceDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 16px 0;
`;

const ServiceDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailIcon = styled.div`
  color: ${theme.colors.primary};
`;

const DetailText = styled.div``;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const DetailLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

const ServiceStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ServiceFooter = styled.div`
  display: flex;
  gap: 8px;
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
  max-width: 800px;
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
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
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
  margin-bottom: 32px;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
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

const PriceTag = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #059669;
`;

const DurationTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6b7280;
`;

const DescriptionSection = styled.div``;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
`;

const DetailsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DetailSection = styled.div``;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ListItem = styled.div`
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
`;

const InstructionsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InstructionGroup = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
`;

const InstructionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InstructionItem = styled.div<{ type: 'before' | 'after' }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  line-height: 1.4;
  padding: 8px;
  background: ${props => props.type === 'before' ? '#fff7ed' : '#f0fdf4'};
  border-radius: 4px;
`;

const InstructionIcon = styled.span`
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const StatisticsSection = styled.div``;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
`;

const StatCardValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const StatCardLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export default DoctorAllServices;