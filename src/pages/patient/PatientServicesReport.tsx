import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiStar,
  FiCheck,
  FiX,
  FiDownload,
  FiPrinter,
  FiEye,
  FiTrendingUp,
  //   FiBarChart3,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { MdMedicalServices, MdHistory } from "react-icons/md";
import { ROUTES } from "@/config/route-paths.config";
import { theme } from "@/config/theme.config";
import Swal from "sweetalert2";

// Mock data for patient's service history
const mockServiceHistory = [
  {
    _id: "hist-001",
    serviceId: "SRV-001",
    serviceName: "General Consultation",
    category: "General Dentistry",
    appointmentDate: "2024-07-15",
    completedDate: "2024-07-15",
    duration: 30,
    cost: 150,
    status: "completed",
    doctorName: "Dr. Sarah Johnson",
    doctorId: "DOC-001",
    rating: 5,
    feedback:
      "Excellent consultation. Dr. Johnson was very thorough and explained everything clearly.",
    treatmentNotes:
      "Routine examination completed. Good oral hygiene. Recommended regular cleanings every 6 months.",
    followUpRequired: false,
    followUpDate: null,
    prescriptions: [],
    images: ["consultation-001.jpg"],
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    insuranceClaimed: true,
    insuranceAmount: 75,
  },
  {
    _id: "hist-002",
    serviceId: "SRV-002",
    serviceName: "Professional Teeth Cleaning",
    category: "General Dentistry",
    appointmentDate: "2024-06-20",
    completedDate: "2024-06-20",
    duration: 45,
    cost: 80,
    status: "completed",
    doctorName: "Dr. Michael Chen",
    doctorId: "DOC-002",
    rating: 4,
    feedback: "Great cleaning service. Felt much cleaner afterwards.",
    treatmentNotes:
      "Deep cleaning performed. Removed moderate tartar buildup. Patient advised to floss daily.",
    followUpRequired: true,
    followUpDate: "2024-12-20",
    prescriptions: [
      {
        medication: "Fluoride Toothpaste",
        dosage: "Twice daily",
        duration: "Ongoing",
      },
    ],
    images: ["cleaning-001.jpg", "cleaning-002.jpg"],
    paymentStatus: "paid",
    paymentMethod: "Insurance",
    insuranceClaimed: true,
    insuranceAmount: 80,
  },
  {
    _id: "hist-003",
    serviceId: "SRV-006",
    serviceName: "Dental Filling",
    category: "General Dentistry",
    appointmentDate: "2024-05-10",
    completedDate: "2024-05-10",
    duration: 45,
    cost: 120,
    status: "completed",
    doctorName: "Dr. Sarah Johnson",
    doctorId: "DOC-001",
    rating: 5,
    feedback: "Pain-free procedure. The filling looks natural.",
    treatmentNotes:
      "Composite filling placed on upper left molar. Cavity was moderate size. Patient tolerated procedure well.",
    followUpRequired: true,
    followUpDate: "2024-11-10",
    prescriptions: [
      {
        medication: "Ibuprofen",
        dosage: "400mg as needed",
        duration: "3 days",
      },
    ],
    images: ["filling-before.jpg", "filling-after.jpg"],
    paymentStatus: "paid",
    paymentMethod: "Cash",
    insuranceClaimed: true,
    insuranceAmount: 60,
  },
  {
    _id: "hist-004",
    serviceId: "SRV-004",
    serviceName: "Cosmetic Teeth Whitening",
    category: "Cosmetic Dentistry",
    appointmentDate: "2024-04-05",
    completedDate: "2024-04-05",
    duration: 60,
    cost: 200,
    status: "completed",
    doctorName: "Dr. Emily Rodriguez",
    doctorId: "DOC-003",
    rating: 4,
    feedback:
      "Good results. Teeth are noticeably whiter. Some sensitivity afterwards but manageable.",
    treatmentNotes:
      "Professional whitening completed. Achieved 3 shades lighter. Patient experienced mild sensitivity.",
    followUpRequired: false,
    followUpDate: null,
    prescriptions: [
      {
        medication: "Sensitivity Toothpaste",
        dosage: "Twice daily",
        duration: "2 weeks",
      },
    ],
    images: ["whitening-before.jpg", "whitening-after.jpg"],
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    insuranceClaimed: false,
    insuranceAmount: 0,
  },
  {
    _id: "hist-005",
    serviceId: "SRV-003",
    serviceName: "Root Canal Treatment",
    category: "Specialized Dental Services",
    appointmentDate: "2024-03-12",
    completedDate: "2024-03-12",
    duration: 90,
    cost: 500,
    status: "completed",
    doctorName: "Dr. Robert Kim",
    doctorId: "DOC-004",
    rating: 5,
    feedback:
      "Dr. Kim was excellent. The procedure was much less painful than expected.",
    treatmentNotes:
      "Root canal therapy completed on lower right molar. Infection cleared. Crown placement recommended.",
    followUpRequired: true,
    followUpDate: "2024-09-12",
    prescriptions: [
      {
        medication: "Amoxicillin",
        dosage: "500mg three times daily",
        duration: "7 days",
      },
      {
        medication: "Ibuprofen",
        dosage: "600mg every 6 hours",
        duration: "5 days",
      },
    ],
    images: ["rootcanal-xray-before.jpg", "rootcanal-xray-after.jpg"],
    paymentStatus: "paid",
    paymentMethod: "Payment Plan",
    insuranceClaimed: true,
    insuranceAmount: 250,
  },
  {
    _id: "hist-006",
    serviceId: "SRV-001",
    serviceName: "General Consultation",
    category: "General Dentistry",
    appointmentDate: "2024-08-22",
    completedDate: null,
    duration: 30,
    cost: 150,
    status: "scheduled",
    doctorName: "Dr. Sarah Johnson",
    doctorId: "DOC-001",
    rating: null,
    feedback: null,
    treatmentNotes: null,
    followUpRequired: false,
    followUpDate: null,
    prescriptions: [],
    images: [],
    paymentStatus: "pending",
    paymentMethod: null,
    insuranceClaimed: false,
    insuranceAmount: 0,
  },
];

const statusOptions = ["all", "completed", "scheduled", "cancelled"];
const categoryOptions = [
  "all",
  "General Dentistry",
  "Specialized Dental Services",
  "Cosmetic Dentistry",
  "Oral Surgery",
];
const yearOptions = ["all", "2024", "2023", "2022"];

const PatientServicesReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "cost" | "rating" | "service">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards");

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      completed: { bg: "#dcfce7", text: "#166534" },
      scheduled: { bg: "#dbeafe", text: "#1e40af" },
      cancelled: { bg: "#fee2e2", text: "#dc2626" },
      "in-progress": { bg: "#fef3c7", text: "#92400e" },
    };
    return colors[status] || { bg: "#f3f4f6", text: "#374151" };
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      "General Dentistry": { bg: "#dbeafe", text: "#1e40af" },
      "Specialized Dental Services": { bg: "#fef3c7", text: "#92400e" },
      "Cosmetic Dentistry": { bg: "#f3e8ff", text: "#7c3aed" },
      "Oral Surgery": { bg: "#fee2e2", text: "#dc2626" },
    };
    return colors[category] || { bg: "#f3f4f6", text: "#374151" };
  };

  const handleViewDetails = (service: any) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleDownloadReport = () => {
    Swal.fire({
      title: "Download Report",
      text: "Generate and download your complete service history report?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme.colors.primary,
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Download PDF",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Generating Report...",
          text: "Your report is being prepared for download.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span style={{ color: "#9ca3af" }}>Not rated</span>;

    return (
      <RatingStars>
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} filled={index < Math.floor(rating)}>
            <FiStar size={12} />
          </Star>
        ))}
      </RatingStars>
    );
  };

  // Filter and sort services
  const filteredAndSortedServices = mockServiceHistory
    .filter((service) => {
      const matchesSearch =
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || service.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || service.category === filterCategory;
      const matchesYear =
        filterYear === "all" ||
        new Date(service.appointmentDate).getFullYear().toString() ===
          filterYear;

      return matchesSearch && matchesStatus && matchesCategory && matchesYear;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;

      switch (sortBy) {
        case "date":
          return (
            multiplier *
            (new Date(a.appointmentDate).getTime() -
              new Date(b.appointmentDate).getTime())
          );
        case "cost":
          return multiplier * (a.cost - b.cost);
        case "rating":
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return multiplier * (ratingA - ratingB);
        case "service":
          return multiplier * a.serviceName.localeCompare(b.serviceName);
        default:
          return 0;
      }
    });

  // Calculate summary statistics
  const completedServices = mockServiceHistory.filter(
    (s) => s.status === "completed"
  );
  const totalSpent = completedServices.reduce((sum, s) => sum + s.cost, 0);
  const totalInsuranceClaimed = completedServices.reduce(
    (sum, s) => sum + s.insuranceAmount,
    0
  );
  const averageRating =
    completedServices
      .filter((s) => s.rating)
      .reduce((sum, s) => sum + (s.rating || 0), 0) /
    completedServices.filter((s) => s.rating).length;

  const summaryStats = {
    totalServices: completedServices.length,
    totalSpent,
    totalInsuranceClaimed,
    averageRating: averageRating || 0,
    upcomingAppointments: mockServiceHistory.filter(
      (s) => s.status === "scheduled"
    ).length,
    followUpsDue: mockServiceHistory.filter(
      (s) =>
        s.followUpRequired &&
        s.followUpDate &&
        new Date(s.followUpDate) <= new Date()
    ).length,
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            <MdHistory size={28} />
            My Service Reports
            <TotalCount>
              ({filteredAndSortedServices.length} records)
            </TotalCount>
          </Title>
          <Subtitle>
            View your complete dental service history and generate reports
          </Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton variant="secondary" onClick={handlePrintReport}>
            <FiPrinter size={16} />
            Print
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleDownloadReport}>
            <FiDownload size={16} />
            Download PDF
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={() => navigate(ROUTES.PATIENT.SERVICES_AVAILABLE)}
          >
            <MdMedicalServices size={16} />
            Book New Service
          </ActionButton>
        </HeaderActions>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryIcon>
            <FiCheck size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>{summaryStats.totalServices}</SummaryValue>
            <SummaryLabel>Services Completed</SummaryLabel>
            <SummarySubtext>Lifetime treatments</SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiDollarSign size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>
              {formatCurrency(summaryStats.totalSpent)}
            </SummaryValue>
            <SummaryLabel>Total Spent</SummaryLabel>
            <SummarySubtext>
              Insurance saved:{" "}
              {formatCurrency(summaryStats.totalInsuranceClaimed)}
            </SummarySubtext>
          </SummaryContent>
        </SummaryCard>

        <SummaryCard>
          <SummaryIcon>
            <FiStar size={24} />
          </SummaryIcon>
          <SummaryContent>
            <SummaryValue>
              {summaryStats.averageRating.toFixed(1)} ⭐
            </SummaryValue>
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
            <SummarySubtext>
              {summaryStats.followUpsDue} follow-ups due
            </SummarySubtext>
          </SummaryContent>
        </SummaryCard>
      </SummaryCards>

      <FiltersAndSearch>
        <SearchSection>
          <SearchContainer>
            <FiSearch size={20} />
            <SearchInput
              type="text"
              placeholder="Search by service, doctor, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <ViewToggle>
            <ViewButton
              active={viewMode === "cards"}
              onClick={() => setViewMode("cards")}
            >
              {/* <FiBarChart3 size={16} /> */}
              Cards
            </ViewButton>
            <ViewButton
              active={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <FiFileText size={16} />
              List
            </ViewButton>
          </ViewToggle>
        </SearchSection>

        <FiltersSection>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              {statusOptions.slice(1).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categoryOptions.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Year</FilterLabel>
            <FilterSelect
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">All Years</option>
              {yearOptions.slice(1).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Sort By</FilterLabel>
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="date">Date</option>
              <option value="cost">Cost</option>
              <option value="rating">Rating</option>
              <option value="service">Service Name</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Order</FilterLabel>
            <FilterSelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersSection>
      </FiltersAndSearch>

      {viewMode === "cards" ? (
        <ServicesGrid>
          {filteredAndSortedServices.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <MdHistory size={64} />
              </EmptyIcon>
              <EmptyTitle>No Service Records Found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search criteria or filters to find the
                records you're looking for.
              </EmptyDescription>
            </EmptyState>
          ) : (
            filteredAndSortedServices.map((service) => (
              <ServiceCard key={service._id} status={service.status}>
                <ServiceHeader>
                  <ServiceTitleRow>
                    <ServiceTitle>{service.serviceName}</ServiceTitle>
                    <StatusBadge
                      style={{
                        backgroundColor: getStatusColor(service.status).bg,
                        color: getStatusColor(service.status).text,
                      }}
                    >
                      {service.status === "completed" && (
                        <FiCheckCircle size={12} />
                      )}
                      {service.status === "scheduled" && <FiClock size={12} />}
                      {service.status === "cancelled" && <FiX size={12} />}
                      {service.status.charAt(0).toUpperCase() +
                        service.status.slice(1)}
                    </StatusBadge>
                  </ServiceTitleRow>
                  <ServiceMeta>
                    <span>{formatDate(service.appointmentDate)}</span>
                    <span>•</span>
                    <span>{service.doctorName}</span>
                  </ServiceMeta>
                </ServiceHeader>

                <ServiceCategory
                  style={{
                    backgroundColor: getCategoryColor(service.category).bg,
                    color: getCategoryColor(service.category).text,
                  }}
                >
                  {service.category}
                </ServiceCategory>

                <ServiceStats>
                  <StatItem>
                    <FiDollarSign size={14} />
                    <StatLabel>Cost:</StatLabel>
                    <StatValue>{formatCurrency(service.cost)}</StatValue>
                  </StatItem>
                  <StatItem>
                    <FiClock size={14} />
                    <StatLabel>Duration:</StatLabel>
                    <StatValue>{service.duration} min</StatValue>
                  </StatItem>
                </ServiceStats>

                {service.status === "completed" && (
                  <ServiceRating>
                    <span>Rating:</span>
                    {renderStars(service.rating)}
                  </ServiceRating>
                )}

                {service.insuranceClaimed && (
                  <InsuranceInfo>
                    <FiCheck size={12} />
                    Insurance: {formatCurrency(service.insuranceAmount)}
                  </InsuranceInfo>
                )}

                {service.followUpRequired && service.followUpDate && (
                  <FollowUpInfo
                    overdue={new Date(service.followUpDate) <= new Date()}
                  >
                    <FiAlertCircle size={12} />
                    Follow-up: {formatDate(service.followUpDate)}
                  </FollowUpInfo>
                )}

                <ServiceActions>
                  <ActionButton
                    variant="secondary"
                    onClick={() => handleViewDetails(service)}
                  >
                    <FiEye size={14} />
                    View Details
                  </ActionButton>
                  {service.status === "completed" && !service.rating && (
                    <ActionButton variant="primary">
                      <FiStar size={14} />
                      Rate Service
                    </ActionButton>
                  )}
                </ServiceActions>
              </ServiceCard>
            ))
          )}
        </ServicesGrid>
      ) : (
        <ServicesList>
          <ListHeader>
            <ListHeaderItem>Service</ListHeaderItem>
            <ListHeaderItem>Date</ListHeaderItem>
            <ListHeaderItem>Doctor</ListHeaderItem>
            <ListHeaderItem>Cost</ListHeaderItem>
            <ListHeaderItem>Status</ListHeaderItem>
            <ListHeaderItem>Rating</ListHeaderItem>
            <ListHeaderItem>Actions</ListHeaderItem>
          </ListHeader>
          {filteredAndSortedServices.map((service) => (
            <ListRow key={service._id}>
              <ListCell>
                <ServiceInfo>
                  <strong>{service.serviceName}</strong>
                  <small>{service.category}</small>
                </ServiceInfo>
              </ListCell>
              <ListCell>{formatDate(service.appointmentDate)}</ListCell>
              <ListCell>{service.doctorName}</ListCell>
              <ListCell>{formatCurrency(service.cost)}</ListCell>
              <ListCell>
                <StatusBadge
                  style={{
                    backgroundColor: getStatusColor(service.status).bg,
                    color: getStatusColor(service.status).text,
                  }}
                >
                  {service.status}
                </StatusBadge>
              </ListCell>
              <ListCell>{renderStars(service.rating)}</ListCell>
              <ListCell>
                <ActionButton
                  variant="secondary"
                  onClick={() => handleViewDetails(service)}
                >
                  <FiEye size={14} />
                </ActionButton>
              </ListCell>
            </ListRow>
          ))}
        </ServicesList>
      )}

      {/* Service Details Modal */}
      {showDetailsModal && selectedService && (
        <Modal onClick={() => setShowDetailsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedService.serviceName} - Details</ModalTitle>
              <CloseButton onClick={() => setShowDetailsModal(false)}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailSection>
                <DetailTitle>Service Information</DetailTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Service Name:</DetailLabel>
                    <DetailValue>{selectedService.serviceName}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Category:</DetailLabel>
                    <DetailValue>{selectedService.category}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Date:</DetailLabel>
                    <DetailValue>
                      {formatDate(selectedService.appointmentDate)}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Duration:</DetailLabel>
                    <DetailValue>
                      {selectedService.duration} minutes
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Cost:</DetailLabel>
                    <DetailValue>
                      {formatCurrency(selectedService.cost)}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Status:</DetailLabel>
                    <DetailValue>{selectedService.status}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              <DetailSection>
                <DetailTitle>Healthcare Provider</DetailTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Doctor:</DetailLabel>
                    <DetailValue>{selectedService.doctorName}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Doctor ID:</DetailLabel>
                    <DetailValue>{selectedService.doctorId}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {selectedService.treatmentNotes && (
                <DetailSection>
                  <DetailTitle>Treatment Notes</DetailTitle>
                  <DetailDescription>
                    {selectedService.treatmentNotes}
                  </DetailDescription>
                </DetailSection>
              )}

              {selectedService.prescriptions.length > 0 && (
                <DetailSection>
                  <DetailTitle>Prescriptions</DetailTitle>
                  <PrescriptionList>
                    {selectedService.prescriptions.map(
                      (prescription: any, index: number) => (
                        <PrescriptionItem key={index}>
                          <PrescriptionName>
                            {prescription.medication}
                          </PrescriptionName>
                          <PrescriptionDetails>
                            {prescription.dosage} - {prescription.duration}
                          </PrescriptionDetails>
                        </PrescriptionItem>
                      )
                    )}
                  </PrescriptionList>
                </DetailSection>
              )}

              <DetailSection>
                <DetailTitle>Payment Information</DetailTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Payment Status:</DetailLabel>
                    <DetailValue>{selectedService.paymentStatus}</DetailValue>
                  </DetailItem>
                  {selectedService.paymentMethod && (
                    <DetailItem>
                      <DetailLabel>Payment Method:</DetailLabel>
                      <DetailValue>{selectedService.paymentMethod}</DetailValue>
                    </DetailItem>
                  )}
                  <DetailItem>
                    <DetailLabel>Insurance Claimed:</DetailLabel>
                    <DetailValue>
                      {selectedService.insuranceClaimed ? "Yes" : "No"}
                    </DetailValue>
                  </DetailItem>
                  {selectedService.insuranceAmount > 0 && (
                    <DetailItem>
                      <DetailLabel>Insurance Amount:</DetailLabel>
                      <DetailValue>
                        {formatCurrency(selectedService.insuranceAmount)}
                      </DetailValue>
                    </DetailItem>
                  )}
                </DetailGrid>
              </DetailSection>

              {selectedService.followUpRequired && (
                <DetailSection>
                  <DetailTitle>Follow-up Information</DetailTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Follow-up Required:</DetailLabel>
                      <DetailValue>Yes</DetailValue>
                    </DetailItem>
                    {selectedService.followUpDate && (
                      <DetailItem>
                        <DetailLabel>Follow-up Date:</DetailLabel>
                        <DetailValue>
                          {formatDate(selectedService.followUpDate)}
                        </DetailValue>
                      </DetailItem>
                    )}
                  </DetailGrid>
                </DetailSection>
              )}

              {selectedService.rating && (
                <DetailSection>
                  <DetailTitle>Your Feedback</DetailTitle>
                  <RatingDisplay>
                    {renderStars(selectedService.rating)}
                    <RatingNumber>{selectedService.rating}/5</RatingNumber>
                  </RatingDisplay>
                  {selectedService.feedback && (
                    <DetailDescription>
                      {selectedService.feedback}
                    </DetailDescription>
                  )}
                </DetailSection>
              )}
            </ModalBody>

            <ModalFooter>
              <ActionButton
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </ActionButton>
              <ActionButton variant="primary">
                <FiDownload size={16} />
                Download Receipt
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

const ActionButton = styled.button<{ variant: "primary" | "secondary" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "primary"
      ? `
    background-color: ${theme.colors.primary};
    color: white;
    &:hover {
      background-color: ${theme.colors.primaryDark};
    }
  `
      : `
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
  background: linear-gradient(
    135deg,
    ${theme.colors.primary},
    ${theme.colors.primaryDark}
  );
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
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

const ViewToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.active
      ? `
    background: white;
    color: ${theme.colors.primary};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `
      : `
    background: transparent;
    color: #64748b;
    
    &:hover {
      color: #374151;
    }
  `}
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
`;

const ServiceCard = styled.div<{ status: string }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  position: relative;
  border-left: 4px solid
    ${(props) => {
      if (props.status === "completed") return "#22c55e";
      if (props.status === "scheduled") return "#3b82f6";
      if (props.status === "cancelled") return "#ef4444";
      return "#6b7280";
    }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ServiceHeader = styled.div`
  margin-bottom: 16px;
`;

const ServiceTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const ServiceTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const ServiceMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
`;

const ServiceCategory = styled.div`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 16px;
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
  margin-bottom: 12px;
  font-size: 14px;
  color: #64748b;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.div<{ filled: boolean }>`
  color: ${(props) => (props.filled ? "#fbbf24" : "#e5e7eb")};
`;

const InsuranceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  background: #d1fae5;
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  width: fit-content;
`;

const FollowUpInfo = styled.div<{ overdue: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${(props) => (props.overdue ? "#dc2626" : "#ea580c")};
  background: ${(props) => (props.overdue ? "#fee2e2" : "#ffedd5")};
  padding: 4px 8px;
  border-radius: 6px;
  margin-bottom: 12px;
  width: fit-content;
`;

const ServiceActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ServicesList = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ListHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr 1fr;
  background: #f8fafc;
  padding: 16px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
`;

const ListHeaderItem = styled.div`
  font-size: 14px;
`;

const ListRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr 1fr 1fr 1fr;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ListCell = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    color: #1e293b;
  }

  small {
    color: #64748b;
    font-size: 12px;
  }
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
  max-width: 900px;
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
  gap: 16px;
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
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
`;

const PrescriptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrescriptionItem = styled.div`
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid ${theme.colors.primary};
`;

const PrescriptionName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const PrescriptionDetails = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const RatingNumber = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
`;

export default PatientServicesReport;
