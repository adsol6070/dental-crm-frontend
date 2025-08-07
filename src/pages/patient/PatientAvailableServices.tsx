// @ts-nocheck
import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiClock, FiDollarSign, FiTag, FiInfo, FiCalendar, FiStar, FiCheck, FiX } from "react-icons/fi";
import { MdMedicalServices } from "react-icons/md";
import { ROUTES } from '@/config/route-paths.config';
import { theme } from '@/config/theme.config';
import Swal from "sweetalert2";

// Mock data for available services
const mockAvailableServices = [
  {
    _id: "1",
    serviceId: "SRV-001",
    name: "General Consultation",
    description: "Comprehensive dental examination and consultation for overall oral health assessment. Includes visual examination, dental charting, and treatment planning.",
    category: "General Dentistry",
    price: 150,
    duration: 30,
    isActive: true,
    prerequisites: ["Valid ID", "Insurance Card (if applicable)"],
    beforeTreatment: ["Brush teeth 2 hours before appointment", "Avoid eating 1 hour before visit"],
    afterTreatment: ["Follow prescribed recommendations", "Schedule follow-up if needed"],
    materials: ["Dental Mirror", "Probe", "Explorer", "X-ray (if required)"],
    tags: ["routine", "preventive", "examination"],
    statistics: {
      totalBookings: 456,
      averageRating: 4.8,
      patientCount: 245,
      completionRate: 98
    },
    estimatedRecovery: "No recovery time needed",
    painLevel: "Painless",
    featured: true
  },
  {
    _id: "2",
    serviceId: "SRV-002",
    name: "Professional Teeth Cleaning",
    description: "Deep cleaning service to remove plaque, tartar, and surface stains. Includes scaling, polishing, and fluoride treatment for optimal oral hygiene.",
    category: "General Dentistry",
    price: 80,
    duration: 45,
    isActive: true,
    prerequisites: ["Recent dental examination (within 6 months)"],
    beforeTreatment: ["Inform about any tooth sensitivity", "Complete medical history form"],
    afterTreatment: ["Wait 30 minutes before eating or drinking", "Use recommended toothpaste"],
    materials: ["Ultrasonic Scaler", "Hand Instruments", "Polishing Paste", "Fluoride Treatment"],
    tags: ["cleaning", "preventive", "hygiene"],
    statistics: {
      totalBookings: 312,
      averageRating: 4.9,
      patientCount: 189,
      completionRate: 99
    },
    estimatedRecovery: "No recovery time needed",
    painLevel: "Minimal discomfort",
    featured: true
  },
  {
    _id: "3",
    serviceId: "SRV-003",
    name: "Root Canal Treatment",
    description: "Advanced endodontic procedure to treat infected or severely damaged teeth. Saves natural tooth by removing infected pulp and sealing the root canals.",
    category: "Specialized Dental Services",
    price: 500,
    duration: 90,
    isActive: true,
    prerequisites: ["X-ray reports", "Pain assessment", "Medical clearance if needed"],
    beforeTreatment: ["Take prescribed antibiotics if given", "Eat light meal before procedure", "Arrange transportation"],
    afterTreatment: ["Take prescribed pain medication", "Avoid chewing on treated side", "Schedule crown placement"],
    materials: ["Local Anesthesia", "Rotary Files", "Gutta Percha", "Temporary Filling"],
    tags: ["advanced", "endodontic", "pain-relief"],
    statistics: {
      totalBookings: 89,
      averageRating: 4.7,
      patientCount: 67,
      completionRate: 96
    },
    estimatedRecovery: "2-3 days mild discomfort",
    painLevel: "Moderate (with anesthesia)",
    featured: false
  },
  {
    _id: "4",
    serviceId: "SRV-004",
    name: "Cosmetic Teeth Whitening",
    description: "Professional in-office whitening treatment for a brighter, more confident smile. Safe and effective removal of stains and discoloration.",
    category: "Cosmetic Dentistry",
    price: 200,
    duration: 60,
    isActive: true,
    prerequisites: ["Recent dental cleaning", "No active cavities", "Healthy gums"],
    beforeTreatment: ["Avoid staining foods 24 hours prior", "Complete dental cleaning if needed"],
    afterTreatment: ["Avoid coffee, tea, wine for 48 hours", "Use sensitivity toothpaste if needed"],
    materials: ["Professional Whitening Gel", "LED Light System", "Protective Barriers"],
    tags: ["cosmetic", "whitening", "aesthetic"],
    statistics: {
      totalBookings: 156,
      averageRating: 4.6,
      patientCount: 98,
      completionRate: 95
    },
    estimatedRecovery: "No recovery time needed",
    painLevel: "Possible temporary sensitivity",
    featured: true
  },
  {
    _id: "5",
    serviceId: "SRV-005",
    name: "Dental Implant",
    description: "Complete tooth replacement solution with titanium implant and natural-looking crown. Permanent solution for missing teeth with excellent durability.",
    category: "Oral Surgery",
    price: 1200,
    duration: 120,
    isActive: true,
    prerequisites: ["CT Scan", "Bone density assessment", "Medical clearance", "Non-smoker status"],
    beforeTreatment: ["Fast 8 hours before surgery", "Arrange post-op transportation", "Take prescribed antibiotics"],
    afterTreatment: ["Apply ice packs as directed", "Soft diet for 1 week", "No smoking", "Return for follow-up"],
    materials: ["Titanium Implant", "Healing Abutment", "Surgical Instruments", "Crown"],
    tags: ["implant", "surgical", "permanent"],
    statistics: {
      totalBookings: 28,
      averageRating: 4.9,
      patientCount: 23,
      completionRate: 100
    },
    estimatedRecovery: "1-2 weeks for initial healing",
    painLevel: "Moderate (well-managed with medication)",
    featured: false
  },
  {
    _id: "6",
    serviceId: "SRV-006",
    name: "Dental Filling",
    description: "Tooth-colored composite filling to restore cavities and minor tooth damage. Natural appearance with excellent durability and strength.",
    category: "General Dentistry",
    price: 120,
    duration: 45,
    isActive: true,
    prerequisites: ["X-ray confirmation of cavity extent"],
    beforeTreatment: ["Inform about any material allergies", "Light meal recommended"],
    afterTreatment: ["Avoid hard foods for 24 hours", "Normal brushing after numbness subsides"],
    materials: ["Composite Resin", "Bonding Agent", "Dental Dam", "Curing Light"],
    tags: ["filling", "restoration", "cavity"],
    statistics: {
      totalBookings: 234,
      averageRating: 4.7,
      patientCount: 156,
      completionRate: 98
    },
    estimatedRecovery: "No recovery time needed",
    painLevel: "Minimal with local anesthesia",
    featured: false
  }
];

const serviceCategories = [
  "General Dentistry",
  "Specialized Dental Services",
  "Cosmetic Dentistry",
  "Oral Surgery",
  "Emergency Services",
  "Orthodontics"
];

const PatientAvailableServices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration' | 'rating'>('featured');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      'General Dentistry': { bg: '#dbeafe', text: '#1e40af' },
      'Specialized Dental Services': { bg: '#fef3c7', text: '#92400e' },
      'Cosmetic Dentistry': { bg: '#f3e8ff', text: '#7c3aed' },
      'Oral Surgery': { bg: '#fee2e2', text: '#dc2626' },
      'Emergency Services': { bg: '#ffedd5', text: '#ea580c' },
      'Orthodontics': { bg: '#d1fae5', text: '#059669' }
    };
    return colors[category] || { bg: '#f3f4f6', text: '#374151' };
  };

  const getPriceRange = (price: number) => {
    if (price <= 100) return 'low';
    if (price <= 300) return 'medium';
    return 'high';
  };

  const handleViewDetails = (service: any) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleBookAppointment = (service: any) => {
    Swal.fire({
      title: `Book ${service.name}?`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Service:</strong> ${service.name}</p>
          <p><strong>Duration:</strong> ${service.duration} minutes</p>
          <p><strong>Cost:</strong> ${formatCurrency(service.price)}</p>
          <p><strong>Category:</strong> ${service.category}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: theme.colors.primary,
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Book Appointment',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Navigate to booking system with pre-selected service
        Swal.fire({
          title: 'Redirecting...',
          text: 'Taking you to the appointment booking system.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        // navigate(`/patient/book-appointment?serviceId=${service._id}`);
      }
    });
  };

  const handleViewMyServices = () => {
    navigate(ROUTES.PATIENT.SERVICES_TAKEN);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} filled={index < Math.floor(rating)}>
        <FiStar size={12} />
      </Star>
    ));
  };

  // Filter and sort services
  const filteredAndSortedServices = mockAvailableServices
    .filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
      const matchesPrice = filterPrice === 'all' || getPriceRange(service.price) === filterPrice;
      const matchesFeatured = !showFeaturedOnly || service.featured;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesFeatured && service.isActive;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      }
      
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'duration':
          return a.duration - b.duration;
        case 'rating':
          return b.statistics.averageRating - a.statistics.averageRating;
        default:
          return 0;
      }
    });

  // Calculate summary statistics
  const summaryStats = {
    total: filteredAndSortedServices.length,
    averagePrice: Math.round(filteredAndSortedServices.reduce((sum, s) => sum + s.price, 0) / filteredAndSortedServices.length),
    priceRange: {
      min: Math.min(...filteredAndSortedServices.map(s => s.price)),
      max: Math.max(...filteredAndSortedServices.map(s => s.price))
    },
    categories: [...new Set(filteredAndSortedServices.map(s => s.category))].length
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
          <Subtitle>Explore our comprehensive dental services and book your next appointment</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton variant="secondary" onClick={handleViewMyServices}>
            <FiClock size={16} />
            My Service History
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
            <SummaryLabel>Services Available</SummaryLabel>
            <SummarySubtext>Across {summaryStats.categories} categories</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiDollarSign size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{formatCurrency(summaryStats.averagePrice)}</SummaryValue>
            <SummaryLabel>Average Cost</SummaryLabel>
            <SummarySubtext>Range: {formatCurrency(summaryStats.priceRange.min)} - {formatCurrency(summaryStats.priceRange.max)}</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiStar size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>4.8 ⭐</SummaryValue>
            <SummaryLabel>Average Rating</SummaryLabel>
            <SummarySubtext>From patient reviews</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
        
        <SummaryCard>
          <SummaryIcon>
            <FiCheck size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>98%</SummaryValue>
            <SummaryLabel>Success Rate</SummaryLabel>
            <SummarySubtext>Treatment completion</SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <FiltersAndSearch>
        <SearchSection>
          <SearchContainer>
            <FiSearch size={20} />
            <SearchInput
              type="text"
              placeholder="Search services, descriptions, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </SearchSection>

        <FiltersSection>
          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {serviceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Price Range</FilterLabel>
            <FilterSelect 
              value={filterPrice} 
              onChange={(e) => setFilterPrice(e.target.value as any)}
            >
              <option value="all">All Prices</option>
              <option value="low">Budget (≤ ₹100)</option>
              <option value="medium">Standard (₹101-300)</option>
              <option value="high">Premium (₹301+)</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Sort By</FilterLabel>
            <FilterSelect 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="featured">Featured First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration</option>
              <option value="rating">Rating</option>
            </FilterSelect>
          </FilterGroup>

          <ToggleGroup>
            <ToggleLabel>
              <ToggleInput
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              />
              <ToggleSlider />
              Featured Only
            </ToggleLabel>
          </ToggleGroup>
        </FiltersSection>
      </FiltersAndSearch>

      <ServicesGrid>
        {filteredAndSortedServices.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <MdMedicalServices size={64} />
            </EmptyIcon>
            <EmptyTitle>No Services Found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search criteria or filters to find the services you're looking for.
            </EmptyDescription>
          </EmptyState>
        ) : (
          filteredAndSortedServices.map(service => (
            <ServiceCard key={service._id} featured={service.featured}>
              {service.featured && (
                <FeaturedBadge>
                  <FiStar size={12} />
                  Featured
                </FeaturedBadge>
              )}
              
              <ServiceHeader>
                <ServiceTitle>{service.name}</ServiceTitle>
                <ServiceId>{service.serviceId}</ServiceId>
              </ServiceHeader>

              <ServiceCategory
                style={{
                  backgroundColor: getCategoryColor(service.category).bg,
                  color: getCategoryColor(service.category).text
                }}
              >
                {service.category}
              </ServiceCategory>

              <ServiceDescription>{service.description}</ServiceDescription>

              <ServiceStats>
                <StatItem>
                  <FiDollarSign size={14} />
                  <StatLabel>Price:</StatLabel>
                  <StatValue>{formatCurrency(service.price)}</StatValue>
                </StatItem>
                <StatItem>
                  <FiClock size={14} />
                  <StatLabel>Duration:</StatLabel>
                  <StatValue>{service.duration} min</StatValue>
                </StatItem>
              </ServiceStats>

              <ServiceRating>
                <RatingStars>
                  {renderStars(service.statistics.averageRating)}
                </RatingStars>
                <RatingText>
                  {service.statistics.averageRating} ({service.statistics.patientCount} patients)
                </RatingText>
              </ServiceRating>

              <ServiceTags>
                {service.tags.slice(0, 3).map(tag => (
                  <ServiceTag key={tag}>
                    <FiTag size={10} />
                    {tag}
                  </ServiceTag>
                ))}
              </ServiceTags>

              <ServiceActions>
                <ActionButton 
                  variant="secondary" 
                  onClick={() => handleViewDetails(service)}
                >
                  <FiInfo size={14} />
                  Details
                </ActionButton>
                <ActionButton 
                  variant="primary" 
                  onClick={() => handleBookAppointment(service)}
                >
                  <FiCalendar size={14} />
                  Book Now
                </ActionButton>
              </ServiceActions>
            </ServiceCard>
          ))
        )}
      </ServicesGrid>

      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <Modal onClick={() => setShowDetailsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedService.name}</ModalTitle>
              <CloseButton onClick={() => setShowDetailsModal(false)}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailSection>
                <DetailTitle>Service Information</DetailTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Service ID:</DetailLabel>
                    <DetailValue>{selectedService.serviceId}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Category:</DetailLabel>
                    <DetailValue>{selectedService.category}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Duration:</DetailLabel>
                    <DetailValue>{selectedService.duration} minutes</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Price:</DetailLabel>
                    <DetailValue>{formatCurrency(selectedService.price)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Pain Level:</DetailLabel>
                    <DetailValue>{selectedService.painLevel}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Recovery Time:</DetailLabel>
                    <DetailValue>{selectedService.estimatedRecovery}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Description</DetailTitle>
                <DetailDescription>{selectedService.description}</DetailDescription>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Prerequisites</DetailTitle>
                <DetailList>
                  {selectedService.prerequisites.map((item: string, index: number) => (
                    <DetailListItem key={index}>{item}</DetailListItem>
                  ))}
                </DetailList>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Before Treatment</DetailTitle>
                <DetailList>
                  {selectedService.beforeTreatment.map((item: string, index: number) => (
                    <DetailListItem key={index}>{item}</DetailListItem>
                  ))}
                </DetailList>
              </DetailSection>

              <DetailSection>
                <DetailTitle>After Treatment</DetailTitle>
                <DetailList>
                  {selectedService.afterTreatment.map((item: string, index: number) => (
                    <DetailListItem key={index}>{item}</DetailListItem>
                  ))}
                </DetailList>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Materials Used</DetailTitle>
                <DetailList>
                  {selectedService.materials.map((item: string, index: number) => (
                    <DetailListItem key={index}>{item}</DetailListItem>
                  ))}
                </DetailList>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Statistics</DetailTitle>
                <StatsGrid>
                  <StatCard>
                    <StatNumber>{selectedService.statistics.totalBookings}</StatNumber>
                    <StatLabel>Total Bookings</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatNumber>{selectedService.statistics.averageRating}</StatNumber>
                    <StatLabel>Average Rating</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatNumber>{selectedService.statistics.patientCount}</StatNumber>
                    <StatLabel>Patients Served</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatNumber>{selectedService.statistics.completionRate}%</StatNumber>
                    <StatLabel>Success Rate</StatLabel>
                  </StatCard>
                </StatsGrid>
              </DetailSection>
            </ModalBody>

            <ModalFooter>
              <ActionButton 
                variant="secondary" 
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </ActionButton>
              <ActionButton 
                variant="primary" 
                onClick={() => {
                  setShowDetailsModal(false);
                  handleBookAppointment(selectedService);
                }}
              >
                <FiCalendar size={16} />
                Book Appointment
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const TotalCount = styled.span`
  font-size: 18px;
  font-weight: 500;
  color: #64748b;
  margin-left: 8px;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 16px;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background-color: ${theme.colors.primary};
    color: white;
    &:hover {
      background-color: ${theme.colors.primaryDark};
    }
  ` : `
    background-color: #f1f5f9;
    color: #475569;
    &:hover {
      background-color: #e2e8f0;
    }
  `}
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SummaryIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 2px;
`;

const SummarySubtext = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const FiltersAndSearch = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchSection = styled.div`
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
  
  svg {
    position: absolute;
    left: 12px;
    color: #64748b;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const FiltersSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 20px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  display: none;
`;

const ToggleSlider = styled.div`
  width: 44px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  position: relative;
  transition: all 0.2s;
  
  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all 0.2s;
  }
  
  ${ToggleInput}:checked + & {
    background: ${theme.colors.primary};
    
    &::before {
      transform: translateX(20px);
    }
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
`;

const ServiceCard = styled.div<{ featured: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  border: ${props => props.featured ? `2px solid ${theme.colors.primary}` : '1px solid #e2e8f0'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: -1px;
  right: -1px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark});
  color: white;
  padding: 6px 12px;
  border-radius: 0 12px 0 12px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ServiceHeader = styled.div`
  margin-bottom: 12px;
`;

const ServiceTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
`;

const ServiceId = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

const ServiceCategory = styled.div`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const ServiceDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ServiceStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
`;

const StatLabel = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const StatValue = styled.span`
  color: #1e293b;
  font-weight: 600;
`;

const ServiceRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.div<{ filled: boolean }>`
  color: ${props => props.filled ? '#fbbf24' : '#e5e7eb'};
`;

const RatingText = styled.span`
  font-size: 12px;
  color: #64748b;
`;

const ServiceTags = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ServiceTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const ServiceActions = styled.div`
  display: flex;
  gap: 12px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  color: #9ca3af;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

const Modal = styled.div`
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

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
`;

const DetailSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const DetailDescription = styled.p`
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
`;

const DetailList = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`;

const DetailListItem = styled.li`
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 4px;
`;

export default PatientAvailableServices;