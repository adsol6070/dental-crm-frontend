import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiPhone, 
  FiEdit3, 
  FiEye, 
  FiRefreshCw, 
  FiFilter, 
  FiDownload, 
  FiPlus,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiPlay,
  FiPause,
  FiStopCircle
} from "react-icons/fi";

// Import the custom hooks (removed appointmentById hook since we're not using it)
import {
  useDoctorAppointments,
  useDoctorTodayAppointments,
  useDoctorUpcomingAppointments,
  // useDoctorAppointmentById, // Commented out since we're using selectedAppointment directly
  useUpdateAppointmentConsultation,
  useUpdateAppointmentStatus
} from "@/hooks/useDoctor";

// TypeScript interfaces based on your actual API response
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PatientInfo {
  _id: string;
  patientId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternatePhone: string;
    address: Address;
  };
}

interface ConsultationData {
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  followUpInstructions?: string;
  doctorNotes?: string;
}

interface AppointmentSummary {
  _id: string;
  appointmentId: string;
  patient: PatientInfo;
  doctor: string; // Doctor ID as string based on your data
  appointmentDateTime: string;
  duration: number;
  appointmentType: string;
  status: string;
  priority: string;
  bookingSource: string;
  symptoms: string[];
  notes?: string;
  specialRequirements?: string;
  remindersSent: number;
  paymentStatus: string;
  paymentAmount?: number;
  consultation?: ConsultationData;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Theme colors matching your existing design
const theme = {
  colors: {
    primary: "#7c3aed",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827"
    }
  }
};

const AppointmentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentSummary | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Backend hooks
  const { 
    data: allAppointments, 
    isLoading: isLoadingAll, 
    error: errorAll, 
    refetch: refetchAll 
  } = useDoctorAppointments();
  
  const { 
    data: todayAppointments, 
    isLoading: isLoadingToday, 
    refetch: refetchToday 
  } = useDoctorTodayAppointments();
  
  const { 
    data: upcomingAppointments, 
    isLoading: isLoadingUpcoming, 
    refetch: refetchUpcoming 
  } = useDoctorUpcomingAppointments();
console.log("upcomingAppointments", upcomingAppointments);

  // const { 
  //   data: appointmentDetails, 
  //   isLoading: isLoadingDetails,
  //   error: appointmentDetailsError
  // } = useDoctorAppointmentById(selectedAppointmentId || '');

  const updateConsultationMutation = useUpdateAppointmentConsultation(selectedAppointmentId || '');
  const updateStatusMutation = useUpdateAppointmentStatus(selectedAppointmentId || '');

  // Get current appointments based on active tab
  const getCurrentAppointments = (): AppointmentSummary[] => {
    switch (activeTab) {
      case 'today':
        return todayAppointments?.data?.appointments || [];
      case 'upcoming':
        return upcomingAppointments?.data?.appointments || [];
      case 'all':
      default:
        return allAppointments?.data?.appointments || [];
    }
  };

  const getCurrentLoading = (): boolean => {
    switch (activeTab) {
      case 'today':
        return isLoadingToday;
      case 'upcoming':
        return isLoadingUpcoming;
      case 'all':
      default:
        return isLoadingAll;
    }
  };

  const appointments = getCurrentAppointments();
  const loading = getCurrentLoading();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Refetch data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'today':
        refetchToday();
        break;
      case 'upcoming':
        refetchUpcoming();
        break;
      case 'all':
        refetchAll();
        break;
    }
  }, [activeTab, refetchToday, refetchUpcoming, refetchAll]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <FiCheck size={12} />;
      case 'completed': return <FiCheck size={12} />;
      case 'in-progress': return <FiPlay size={12} />;
      case 'cancelled': return <FiX size={12} />;
      case 'no-show': return <FiAlertCircle size={12} />;
      default: return <FiClock size={12} />;
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      setSelectedAppointmentId(appointmentId);
      await updateStatusMutation.mutateAsync({ status: newStatus });
      
      // Refetch current tab data
      switch (activeTab) {
        case 'today':
          refetchToday();
          break;
        case 'upcoming':
          refetchUpcoming();
          break;
        case 'all':
          refetchAll();
          break;
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleViewDetails = (appointment: AppointmentSummary) => {
    console.log('🔍 Opening details for appointment:', {
      id: appointment._id,
      appointmentId: appointment.appointmentId,
      patient: appointment.patient,
      fullAppointment: appointment
    });
    
    // Set both the appointment and ID immediately
    setSelectedAppointment(appointment);
    console.log("appointment detail modal", appointment);
    setSelectedAppointmentId(appointment._id);
    setIsDetailsModalOpen(true);
  };

  const handleStartConsultation = (appointment: AppointmentSummary) => {
    console.log('🏥 Starting consultation for appointment:', appointment);
    setSelectedAppointment(appointment);
    setSelectedAppointmentId(appointment._id);
    setIsConsultationModalOpen(true);
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case 'today':
        refetchToday();
        break;
      case 'upcoming':
        refetchUpcoming();
        break;
      case 'all':
        refetchAll();
        break;
    }
  };

  // Helper functions to extract patient info with comprehensive null safety
  const getPatientName = (appointment: AppointmentSummary | null): string => {
    if (!appointment) {
      console.warn('❌ No appointment provided to getPatientName');
      return 'Unknown Patient';
    }
    
    if (!appointment.patient) {
      console.warn('❌ No patient data in appointment:', appointment._id);
      return 'Unknown Patient';
    }
    
    if (!appointment.patient.personalInfo) {
      console.warn('❌ No personalInfo in patient data:', appointment.patient);
      return 'Unknown Patient';
    }
    
    const firstName = appointment.patient.personalInfo.firstName || '';
    const lastName = appointment.patient.personalInfo.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    console.log('✅ Patient name extracted:', fullName, 'from:', appointment.patient.personalInfo);
    return fullName || 'Unknown Patient';
  };

  const getPatientPhone = (appointment: AppointmentSummary | null): string => {
    const phone = appointment?.patient?.contactInfo?.phone || 'N/A';
    console.log('📞 Patient phone:', phone);
    return phone;
  };

  const getPatientEmail = (appointment: AppointmentSummary | null): string => {
    const email = appointment?.patient?.contactInfo?.email || 'N/A';
    console.log('📧 Patient email:', email);
    return email;
  };

  const getPatientAge = (appointment: AppointmentSummary | null): string | number => {
    if (!appointment?.patient?.personalInfo?.dateOfBirth) {
      console.log('🎂 No DOB available for age calculation');
      return 'N/A';
    }
    
    try {
      const dob = new Date(appointment.patient.personalInfo.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      console.log('🎂 Patient age calculated:', age);
      return age;
    } catch (error) {
      console.error('❌ Error calculating age:', error);
      return 'N/A';
    }
  };

  const getPatientAddress = (appointment: AppointmentSummary | null): string => {
    const address = appointment?.patient?.contactInfo?.address;
    if (!address) {
      console.log('🏠 No address available');
      return 'N/A';
    }
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode
    ].filter(Boolean);
    
    const fullAddress = parts.join(', ') || 'N/A';
    console.log('🏠 Patient address:', fullAddress);
    return fullAddress;
  };

  const formatAppointmentTime = (appointmentDateTime: string): string => {
    try {
      const date = new Date(appointmentDateTime);
      const formatted = date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      console.log('⏰ Time formatted:', formatted, 'from:', appointmentDateTime);
      return formatted;
    } catch (error) {
      console.error('❌ Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const AppointmentCard: React.FC<{ appointment: AppointmentSummary }> = ({ appointment }) => {
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const isToday = appointmentDate.toDateString() === new Date().toDateString();
    const isCurrent = Math.abs(appointmentDate.getTime() - currentTime.getTime()) <= 15 * 60 * 1000; // Within 15 mins

    const patientName = getPatientName(appointment);
    const patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
      <CardContainer isToday={isToday} isCurrent={isCurrent}>
        <CardHeader>
          <PatientInfo>
            <PatientAvatar>
              {patientInitials}
            </PatientAvatar>
            <PatientDetails>
              <PatientName>{patientName}</PatientName>
              <AppointmentId>#{appointment.appointmentId}</AppointmentId>
            </PatientDetails>
          </PatientInfo>
          <StatusBadge status={appointment.status}>
            {getStatusIcon(appointment.status)}
            {appointment.status?.replace('-', ' ') || 'scheduled'}
          </StatusBadge>
        </CardHeader>

        <CardContent>
          <AppointmentDetails>
            <DetailRow>
              <FiCalendar size={14} />
              <span>{appointmentDate.toLocaleDateString('en-IN')}</span>
            </DetailRow>
            <DetailRow>
              <FiClock size={14} />
              <span>
                {formatAppointmentTime(appointment.appointmentDateTime)} 
                ({appointment.duration || 30} min)
              </span>
            </DetailRow>
            <DetailRow>
              <FiUser size={14} />
              <span>{appointment.appointmentType || 'Consultation'}</span>
            </DetailRow>
            <DetailRow>
              <FiPhone size={14} />
              <span>{getPatientPhone(appointment)}</span>
            </DetailRow>
          </AppointmentDetails>

          <SymptomsText>
            <strong>Symptoms:</strong> {
              Array.isArray(appointment.symptoms) 
                ? appointment.symptoms.join(', ') 
                : appointment.symptoms || 'Not specified'
            }
          </SymptomsText>

          <FeesAmount>₹{appointment.paymentAmount || 500}</FeesAmount>
        </CardContent>

        <CardActions>
          <ActionButton 
            variant="primary" 
            onClick={() => handleViewDetails(appointment)}
          >
            <FiEye size={14} />
            View Details
          </ActionButton>
          
          {appointment.status === 'confirmed' && (
            <ActionButton 
              variant="success"
              onClick={() => handleStatusUpdate(appointment._id, 'in-progress')}
              disabled={updateStatusMutation.isLoading}
            >
              <FiPlay size={14} />
              Start
            </ActionButton>
          )}
          
          {appointment.status === 'in-progress' && (
            <ActionButton 
              variant="warning"
              onClick={() => handleStartConsultation(appointment)}
            >
              <FiEdit3 size={14} />
              Add Notes
            </ActionButton>
          )}

          {appointment.status === 'scheduled' && (
            <ActionButton 
              variant="primary"
              onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
              disabled={updateStatusMutation.isLoading}
            >
              <FiCheck size={14} />
              Confirm
            </ActionButton>
          )}
        </CardActions>
      </CardContainer>
    );
  };

  const AppointmentDetailsModal: React.FC = () => {
    // Always use selectedAppointment as the primary source since we have all the data
    // Only use appointmentDetails if it has more complete data
    const appointment = /* (appointmentDetails?.data && Object.keys(appointmentDetails.data).length > 0) 
      ? appointmentDetails.data 
      :  */selectedAppointment;
    
    console.log('🗂️ Modal rendering with appointment:', {
     /*  hasAppointmentDetails: !!appointmentDetails?.data, */
      hasSelectedAppointment: !!selectedAppointment,
      finalAppointment: appointment,
      isModalOpen: isDetailsModalOpen
    });
    
    if (!appointment || !isDetailsModalOpen) {
      console.log('🚫 Modal not rendering - missing appointment or modal closed');
      return null;
    }

    return (
      <ModalOverlay onClick={() => setIsDetailsModalOpen(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <h2>Appointment Details</h2>
            <CloseButton onClick={() => setIsDetailsModalOpen(false)}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            {!selectedAppointment ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading appointment details...</LoadingText>
              </LoadingContainer>
            ) : (
              <>
                <DetailSection>
                  <SectionTitle>Patient Information</SectionTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Name</DetailLabel>
                      <DetailValue>{getPatientName(appointment)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Patient ID</DetailLabel>
                      <DetailValue>{appointment.patient?.patientId || 'N/A'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Age</DetailLabel>
                      <DetailValue>{getPatientAge(appointment)} years</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Gender</DetailLabel>
                      <DetailValue>
                        {appointment.patient?.personalInfo?.gender ? 
                          appointment.patient.personalInfo.gender.charAt(0).toUpperCase() + 
                          appointment.patient.personalInfo.gender.slice(1) : 'N/A'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Blood Group</DetailLabel>
                      <DetailValue>{appointment.patient?.personalInfo?.bloodGroup || 'N/A'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Phone</DetailLabel>
                      <DetailValue>{getPatientPhone(appointment)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Alternate Phone</DetailLabel>
                      <DetailValue>{appointment.patient?.contactInfo?.alternatePhone || 'N/A'}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Email</DetailLabel>
                      <DetailValue>{getPatientEmail(appointment)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Address</DetailLabel>
                      <DetailValue>{getPatientAddress(appointment)}</DetailValue>
                    </DetailItem>
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Appointment Details</SectionTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Appointment ID</DetailLabel>
                      <DetailValue>{appointment.appointmentId}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Date & Time</DetailLabel>
                      <DetailValue>
                        {new Date(appointment.appointmentDateTime).toLocaleDateString('en-IN')} at{' '}
                        {formatAppointmentTime(appointment.appointmentDateTime)}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Duration</DetailLabel>
                      <DetailValue>{appointment.duration || 30} minutes</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Type</DetailLabel>
                      <DetailValue>
                        {appointment.appointmentType?.charAt(0).toUpperCase() + 
                         appointment.appointmentType?.slice(1) || 'Consultation'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Priority</DetailLabel>
                      <DetailValue>
                        {appointment.priority?.charAt(0).toUpperCase() + 
                         appointment.priority?.slice(1) || 'Medium'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Booking Source</DetailLabel>
                      <DetailValue>
                        {appointment.bookingSource?.charAt(0).toUpperCase() + 
                         appointment.bookingSource?.slice(1) || 'N/A'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Fees</DetailLabel>
                      <DetailValue>₹{appointment.paymentAmount || 500}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Payment Status</DetailLabel>
                      <DetailValue>
                        <StatusBadge status={appointment.paymentStatus}>
                          {appointment.paymentStatus?.charAt(0).toUpperCase() + 
                           appointment.paymentStatus?.slice(1) || 'Pending'}
                        </StatusBadge>
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Status</DetailLabel>
                      <DetailValue>
                        <StatusBadge status={appointment.status}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status?.replace('-', ' ') || 'scheduled'}
                        </StatusBadge>
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Reminders Sent</DetailLabel>
                      <DetailValue>{appointment.remindersSent || 0}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>End Time</DetailLabel>
                      <DetailValue>
                        {appointment.endDateTime ? 
                          formatAppointmentTime(appointment.endDateTime) : 
                          'Not set'
                        }
                      </DetailValue>
                    </DetailItem>
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <SectionTitle>Medical Information</SectionTitle>
                  <DetailItem>
                    <DetailLabel>Symptoms</DetailLabel>
                    <DetailValue>
                      {Array.isArray(appointment.symptoms) 
                        ? appointment.symptoms.join(', ') 
                        : appointment.symptoms || 'Not specified'}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Notes</DetailLabel>
                    <DetailValue>{appointment.notes || 'No notes available'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Special Requirements</DetailLabel>
                    <DetailValue>{appointment.specialRequirements || 'None'}</DetailValue>
                  </DetailItem>
                  {appointment.consultation && (
                    <>
                      <DetailItem>
                        <DetailLabel>Diagnosis</DetailLabel>
                        <DetailValue>{appointment.consultation.diagnosis || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Treatment</DetailLabel>
                        <DetailValue>{appointment.consultation.treatment || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Medications</DetailLabel>
                        <DetailValue>{appointment.consultation.medications || 'N/A'}</DetailValue>
                      </DetailItem>
                    </>
                  )}
                </DetailSection>

                {appointment.metadata && (
                  <DetailSection>
                    <SectionTitle>Technical Information</SectionTitle>
                    <DetailGrid>
                      <DetailItem>
                        <DetailLabel>Created At</DetailLabel>
                        <DetailValue>
                          {new Date(appointment.createdAt).toLocaleDateString('en-IN')} at{' '}
                          {new Date(appointment.createdAt).toLocaleTimeString('en-IN')}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Last Updated</DetailLabel>
                        <DetailValue>
                          {new Date(appointment.updatedAt).toLocaleDateString('en-IN')} at{' '}
                          {new Date(appointment.updatedAt).toLocaleTimeString('en-IN')}
                        </DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>IP Address</DetailLabel>
                        <DetailValue>{appointment.metadata.ipAddress || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>User Agent</DetailLabel>
                        <DetailValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                          {appointment.metadata.userAgent ? 
                            appointment.metadata.userAgent.slice(0, 50) + '...' : 'N/A'}
                        </DetailValue>
                      </DetailItem>
                    </DetailGrid>
                  </DetailSection>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <SecondaryButton onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </SecondaryButton>
            {appointment.status !== 'completed' && (
              <PrimaryButton onClick={() => {
                setIsDetailsModalOpen(false);
                setIsConsultationModalOpen(true);
              }}>
                Add Consultation Notes
              </PrimaryButton>
            )}
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const ConsultationModal: React.FC = () => {
    const [consultationNotes, setConsultationNotes] = useState({
      symptoms: Array.isArray(selectedAppointment?.symptoms) 
        ? selectedAppointment.symptoms.join(', ') 
        : selectedAppointment?.symptoms || '',
      diagnosis: '',
      treatment: '',
      medications: '',
      followUpInstructions: '',
      doctorNotes: ''
    });

    if (!selectedAppointment || !isConsultationModalOpen) return null;

    const handleSaveConsultation = async () => {
      try {
        await updateConsultationMutation.mutateAsync({
          symptoms: consultationNotes.symptoms,
          diagnosis: consultationNotes.diagnosis,
          treatment: consultationNotes.treatment,
          medications: consultationNotes.medications,
          followUpInstructions: consultationNotes.followUpInstructions,
          doctorNotes: consultationNotes.doctorNotes
        });

        // Update status to completed
        await updateStatusMutation.mutateAsync({ status: 'completed' });
        
        setIsConsultationModalOpen(false);
        
        // Refetch data
        switch (activeTab) {
          case 'today':
            refetchToday();
            break;
          case 'upcoming':
            refetchUpcoming();
            break;
          case 'all':
            refetchAll();
            break;
        }
      } catch (error) {
        console.error('Failed to save consultation:', error);
      }
    };

    return (
      <ModalOverlay onClick={() => setIsConsultationModalOpen(false)}>
        <ModalContent large onClick={e => e.stopPropagation()}>
          <ModalHeader>
            <h2>Consultation Notes - {getPatientName(selectedAppointment)}</h2>
            <CloseButton onClick={() => setIsConsultationModalOpen(false)}>
              <FiX size={20} />
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            <FormSection>
              <FormGroup>
                <FormLabel>Patient Symptoms</FormLabel>
                <FormTextArea
                  value={consultationNotes.symptoms}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describe patient's symptoms..."
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Diagnosis</FormLabel>
                <FormTextArea
                  value={consultationNotes.diagnosis}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Treatment Plan</FormLabel>
                <FormTextArea
                  value={consultationNotes.treatment}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Describe treatment plan..."
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Medications</FormLabel>
                <FormTextArea
                  value={consultationNotes.medications}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, medications: e.target.value }))}
                  placeholder="List prescribed medications..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Follow-up Instructions</FormLabel>
                <FormTextArea
                  value={consultationNotes.followUpInstructions}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, followUpInstructions: e.target.value }))}
                  placeholder="Instructions for patient..."
                  rows={2}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Doctor's Private Notes</FormLabel>
                <FormTextArea
                  value={consultationNotes.doctorNotes}
                  onChange={(e) => setConsultationNotes(prev => ({ ...prev, doctorNotes: e.target.value }))}
                  placeholder="Private notes for future reference..."
                  rows={2}
                />
              </FormGroup>
            </FormSection>
          </ModalBody>

          <ModalFooter>
            <SecondaryButton 
              onClick={() => setIsConsultationModalOpen(false)}
              disabled={updateConsultationMutation.isLoading}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              onClick={handleSaveConsultation}
              disabled={updateConsultationMutation.isLoading}
            >
              {updateConsultationMutation.isLoading ? 'Saving...' : 'Save & Complete Appointment'}
            </PrimaryButton>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
  };

  // Calculate today's stats
  const todayStats = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointmentDateTime);
    return appointmentDate.toDateString() === new Date().toDateString();
  });

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>
            Appointment Management
            <TotalCount>({appointments.length} total)</TotalCount>
          </Title>
          <Subtitle>Manage your appointments and patient consultations</Subtitle>
          
          {activeTab === 'today' && (
            <StatsContainer>
              <StatCard>
                <StatValue>{todayStats.length}</StatValue>
                <StatLabel>Total Today</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{todayStats.filter(a => a.status === 'completed').length}</StatValue>
                <StatLabel>Completed</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>
                  {todayStats.filter(a => !['completed', 'cancelled', 'no-show'].includes(a.status)).length}
                </StatValue>
                <StatLabel>Remaining</StatLabel>
              </StatCard>
            </StatsContainer>
          )}
        </HeaderContent>
        
        <HeaderActions>
          <RefreshButton onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          <FilterButton>
            <FiFilter size={16} />
            Filters
          </FilterButton>
          <ExportButton>
            <FiDownload size={16} />
            Export
          </ExportButton>
        </HeaderActions>
      </Header>

      <TabContainer>
        <TabButton 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          All Appointments
        </TabButton>
        <TabButton 
          active={activeTab === 'today'} 
          onClick={() => setActiveTab('today')}
        >
          Today's Schedule
        </TabButton>
        <TabButton 
          active={activeTab === 'upcoming'} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </TabButton>
      </TabContainer>

      <Content>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading appointments...</LoadingText>
          </LoadingContainer>
        ) : errorAll ? (
          <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Error Loading Appointments</ErrorTitle>
            <ErrorMessage>
              {errorAll?.message || 'Failed to load appointments. Please try again.'}
            </ErrorMessage>
            <PrimaryButton onClick={handleRefresh}>
              <FiRefreshCw size={16} />
              Retry
            </PrimaryButton>
          </ErrorContainer>
        ) : appointments.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📅</EmptyIcon>
            <EmptyTitle>No appointments found</EmptyTitle>
            <EmptyMessage>
              {activeTab === 'today' 
                ? "No appointments scheduled for today"
                : activeTab === 'upcoming'
                ? "No upcoming appointments"
                : "No appointments in the system"
              }
            </EmptyMessage>
          </EmptyState>
        ) : (
          <AppointmentGrid>
            {appointments.map(appointment => (
              <AppointmentCard key={appointment._id} appointment={appointment} />
            ))}
          </AppointmentGrid>
        )}
      </Content>

      <AppointmentDetailsModal />
      <ConsultationModal />
    </Container>
  );
};

// Styled Components with proper TypeScript interfaces
interface CardContainerProps {
  isToday: boolean;
  isCurrent: boolean;
}

interface TabButtonProps {
  active: boolean;
}

interface StatusBadgeProps {
  status: string;
}

interface ActionButtonProps {
  variant: 'primary' | 'success' | 'warning';
  disabled?: boolean;
}

interface ModalContentProps {
  large?: boolean;
}

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
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const TotalCount = styled.span`
  font-size: 16px;
  font-weight: 400;
  opacity: 0.8;
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 80px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RefreshButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const FilterButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ExportButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: ${theme.colors.gray[50]};
`;

const TabButton = styled.button<TabButtonProps>`
  padding: 16px 24px;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: ${props => props.active ? '600' : '500'};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'white' : theme.colors.gray[100]};
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const AppointmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CardContainer = styled.div<CardContainerProps>`
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.2s;
  ${props => props.isToday && `border-color: ${theme.colors.primary}; box-shadow: 0 0 0 1px ${theme.colors.primary}20;`}
  ${props => props.isCurrent && `border-color: ${theme.colors.warning}; box-shadow: 0 4px 12px ${theme.colors.warning}20;`}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
`;

const PatientDetails = styled.div``;

const PatientName = styled.div`
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin-bottom: 2px;
`;

const AppointmentId = styled.div`
  font-size: 12px;
  color: ${theme.colors.gray[500]};
`;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return theme.colors.primary;
    case 'completed': return theme.colors.success;
    case 'in-progress': return theme.colors.warning;
    case 'cancelled': return theme.colors.danger;
    case 'no-show': return theme.colors.danger;
    case 'pending': return theme.colors.warning;
    default: return theme.colors.gray[500];
  }
};

const StatusBadge = styled.span<StatusBadgeProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => getStatusColor(props.status)}20;
  color: ${props => getStatusColor(props.status)};
`;

const CardContent = styled.div`
  margin-bottom: 16px;
`;

const AppointmentDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${theme.colors.gray[600]};
`;

const SymptomsText = styled.div`
  font-size: 13px;
  color: ${theme.colors.gray[700]};
  margin-bottom: 12px;
  line-height: 1.4;
`;

const FeesAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.success};
  text-align: right;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<ActionButtonProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary}10;
          border-color: ${theme.colors.primary}30;
          color: ${theme.colors.primary};
          &:hover:not(:disabled) { background: ${theme.colors.primary}20; }
        `;
      case 'success':
        return `
          background: ${theme.colors.success}10;
          border-color: ${theme.colors.success}30;
          color: ${theme.colors.success};
          &:hover:not(:disabled) { background: ${theme.colors.success}20; }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning}10;
          border-color: ${theme.colors.warning}30;
          color: ${theme.colors.warning};
          &:hover:not(:disabled) { background: ${theme.colors.warning}20; }
        `;
      default:
        return `
          background: ${theme.colors.gray[100]};
          border-color: ${theme.colors.gray[300]};
          color: ${theme.colors.gray[700]};
          &:hover:not(:disabled) { background: ${theme.colors.gray[200]}; }
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${theme.colors.gray[200]};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: ${theme.colors.gray[600]};
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.danger};
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray[500]};
  margin: 0 0 20px 0;
  max-width: 400px;
  line-height: 1.5;
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
  color: ${theme.colors.gray[700]};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.gray[500]};
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
`;

// Modal Components
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

const ModalContent = styled.div<ModalContentProps>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: ${props => props.large ? '800px' : '600px'};
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.gray[200]};

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
  }
`;

const CloseButton = styled.button`
  padding: 4px;
  border: none;
  background: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.gray[100]};
    color: ${theme.colors.gray[700]};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

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

const SecondaryButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: ${theme.colors.gray[700]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Detail Modal Components
const DetailSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.gray[600]};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: ${theme.colors.gray[900]};
  font-weight: 500;
`;

// Form Components
const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.gray[700]};
`;

const FormTextArea = styled.textarea`
  padding: 12px;
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${theme.colors.gray[500]};
  }
`;

export default AppointmentManagement;