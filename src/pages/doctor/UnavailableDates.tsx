// @ts-nocheck
import React, { useState } from "react";
import styled from "styled-components";
import {  
  FiPlus, 
  FiTrash, 
  FiRefreshCw, 
  FiDownload,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Swal from "sweetalert2";

// Import backend hooks
import {
  useUnavailableDates,
  useUnavailableDatesSummary,
  useCreateUnavailableDateRange,
  useDeleteUnavailableDates,
  useBulkDeleteUnavailableDate,
} from "@/hooks/useDoctor";

// Types
interface UnavailableDate {
  id: string;
  date: string;
  reason: string;
  type: 'full-day' | 'half-day' | 'morning' | 'afternoon';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AddUnavailableDateRangePayload {
  startDate: string;
  endDate: string;
  reason: string;
  type: 'full-day' | 'half-day' | 'morning' | 'afternoon';
  notes?: string;
}

interface LeaveType {
  value: string;
  label: string;
}

interface DayType {
  value: 'full-day' | 'half-day' | 'morning' | 'afternoon';
  label: string;
}

interface AddLeaveModalProps {
  selectedDate: Date | null;
  onClose: () => void;
  onAdd: (data: AddUnavailableDateRangePayload) => Promise<void>;
  isSubmitting: boolean;
  leaveTypes: LeaveType[];
  dayTypes: DayType[];
}

interface UnavailableDatesSummary {
  total: number;
  upcoming: number;
  past: number;
  thisMonth: number;
}

// Theme configuration
const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    white: '#ffffff',
    primaryDark: '#4f46e5',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    lightGray: '#e5e7eb'
  }
};

// Helper functions for date handling
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const DoctorUnavailableDays: React.FC = () => {
  // Backend hooks
  const { 
    data: unavailableDates = [], 
    isLoading, 
    error,
    refetch 
  } = useUnavailableDates();

  const { 
    data: summary = { total: 0, upcoming: 0, past: 0, thisMonth: 0 } as UnavailableDatesSummary
  } = useUnavailableDatesSummary();

  const createUnavailableDateRange = useCreateUnavailableDateRange();
  const deleteUnavailableDates = useDeleteUnavailableDates();
  const deleteBulkUnavailableDates = useBulkDeleteUnavailableDate();

  // Local state
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'full-day' | 'half-day' | 'morning' | 'afternoon'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [quickAddMode, setQuickAddMode] = useState(false);

  const leaveTypes: LeaveType[] = [
    { value: 'personal', label: 'Personal Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'vacation', label: 'Vacation' },
    { value: 'conference', label: 'Medical Conference' },
    { value: 'emergency', label: 'Emergency Leave' },
    { value: 'other', label: 'Other' }
  ];

  const dayTypes: DayType[] = [
    { value: 'full-day', label: 'Full Day' },
    { value: 'half-day', label: 'Half Day' },
    { value: 'morning', label: 'Morning Only' },
    { value: 'afternoon', label: 'Afternoon Only' }
  ];

  // Helper functions
  const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? createLocalDate(dateInput) : dateInput;
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateLong = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? createLocalDate(dateInput) : dateInput;
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isDateUnavailable = (date: Date): boolean => {
    const dateStr = formatDateToLocal(date);
    return unavailableDates.some(d => d.date === dateStr);
  };

  const getUnavailableDateInfo = (date: Date): UnavailableDate | undefined => {
    const dateStr = formatDateToLocal(date);
    return unavailableDates.find(d => d.date === dateStr);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (dateString: string): boolean => {
    const inputDate = createLocalDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return inputDate < today;
  };

  const isUpcomingDate = (dateString: string): boolean => {
    const inputDate = createLocalDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return inputDate >= today;
  };

  // Filter unavailable dates
  const filteredUnavailableDates = unavailableDates.filter(leave => {
    const matchesSearch = 
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (leave.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      formatDate(leave.date).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || leave.type === filterType;

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'upcoming' && isUpcomingDate(leave.date)) ||
      (filterStatus === 'past' && isPastDate(leave.date));

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate calendar days
  const generateCalendarDays = (): Date[] => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Event handlers
  const handleCalendarClick = (clickedDate: Date): void => {
    if (clickedDate.getMonth() !== currentMonth) return;

    const unavailableInfo = getUnavailableDateInfo(clickedDate);
    
    if (unavailableInfo) {
      handleRemoveDate(unavailableInfo.id, unavailableInfo.reason);
    } else {
      if (quickAddMode) {
        handleQuickAdd(clickedDate);
      } else {
        setSelectedDate(clickedDate);
        setShowAddModal(true);
      }
    }
  };

  const handleQuickAdd = async (date: Date): Promise<void> => {
    try {
      const dateStr = formatDateToLocal(date);
      
      await createUnavailableDateRange.mutateAsync({
        startDate: dateStr,
        endDate: dateStr,
        reason: 'Personal Leave',
        type: 'full-day',
        notes: 'Quick add'
      });
      
      Swal.fire({
        title: 'Success!',
        text: 'Date marked as unavailable.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Quick add error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to mark date as unavailable.',
        icon: 'error',
      });
    }
  };

  const handleAddLeave = async (leaveData: AddUnavailableDateRangePayload): Promise<void> => {
    try {
      await createUnavailableDateRange.mutateAsync(leaveData);

      const startDate = createLocalDate(leaveData.startDate);
      const endDate = createLocalDate(leaveData.endDate);
      const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      setShowAddModal(false);
      setSelectedDate(null);
      
      Swal.fire({
        title: 'Success!',
        text: `${dayCount} date(s) marked as unavailable.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Add leave error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add unavailable dates.',
        icon: 'error',
      });
    }
  };

  const handleRemoveDate = async (dateId: string, reason: string): Promise<void> => {
    const result = await Swal.fire({
      title: 'Remove Unavailable Date?',
      text: `Remove "${reason}" from your unavailable dates?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.colors.danger,
      cancelButtonColor: theme.colors.textSecondary,
      confirmButtonText: 'Yes, remove it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteUnavailableDates.mutateAsync(dateId);
        
        Swal.fire({
          title: 'Removed!',
          text: 'Date has been removed from unavailable list.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Remove date error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to remove unavailable date.',
          icon: 'error',
        });
      }
    }
  };

  const handleBulkRemove = async (): Promise<void> => {
    if (selectedDates.length === 0) return;

    const result = await Swal.fire({
      title: `Remove ${selectedDates.length} dates?`,
      text: 'These dates will become available for appointments.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.colors.danger,
      cancelButtonColor: theme.colors.textSecondary,
      confirmButtonText: 'Yes, remove them!',
    });

    if (result.isConfirmed) {
      try {
        await deleteBulkUnavailableDates.mutateAsync({dateIds: selectedDates});

        setSelectedDates([]);
        Swal.fire({
          title: 'Success!',
          text: `${selectedDates.length} dates removed successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Bulk remove error:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Some dates could not be removed.',
          icon: 'error',
        });
      }
    }
  };

  const handleMonthNavigation = (direction: 'prev' | 'next'): void => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleExport = (): void => {
    const csvContent = [
      ['Date', 'Reason', 'Type', 'Notes', 'Created At'],
      ...unavailableDates.map(leave => [
        leave.date,
        leave.reason,
        leave.type,
        leave.notes || '',
        new Date(leave.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unavailable-dates-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading unavailable dates...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Failed to Load Data</ErrorTitle>
          <ErrorMessage>Unable to load unavailable dates. Please try again.</ErrorMessage>
          <RetryButton onClick={() => refetch()}>
            <FiRefreshCw size={16} />
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>Leave Management</Title>
          <Subtitle>Manage your unavailable dates and leave schedule</Subtitle>
          <StatsRow>
            <StatItem>
              <StatNumber>{summary.total}</StatNumber>
              <StatLabel>Total Leaves</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{summary.upcoming}</StatNumber>
              <StatLabel>Upcoming</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{summary.thisMonth}</StatNumber>
              <StatLabel>This Month</StatLabel>
            </StatItem>
          </StatsRow>
        </HeaderContent>
        <HeaderActions>
          <QuickModeToggle>
            <QuickModeCheckbox
              type="checkbox"
              checked={quickAddMode}
              onChange={(e) => setQuickAddMode(e.target.checked)}
            />
            <QuickModeLabel>Quick Add</QuickModeLabel>
          </QuickModeToggle>
          <RefreshButton onClick={() => refetch()}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
          <ExportButton onClick={handleExport}>
            <FiDownload size={16} />
            Export
          </ExportButton>
          <AddLeaveButton onClick={() => setShowAddModal(true)}>
            <FiPlus size={16} />
            Add Leave
          </AddLeaveButton>
        </HeaderActions>
      </Header>

      <ContentGrid>
        {/* Calendar Panel */}
        <CalendarPanel>
          <CalendarHeader>
            <CalendarNavigation>
              <NavButton onClick={() => handleMonthNavigation('prev')}>
                <FiChevronLeft size={18} />
              </NavButton>
              <MonthTitle>
                {monthNames[currentMonth]} {currentYear}
              </MonthTitle>
              <NavButton onClick={() => handleMonthNavigation('next')}>
                <FiChevronRight size={18} />
              </NavButton>
            </CalendarNavigation>
            <CalendarLegend>
              <LegendItem>
                <LegendDot $color={theme.colors.danger} />
                Unavailable
              </LegendItem>
              <LegendItem>
                <LegendDot $color={theme.colors.primary} />
                Today
              </LegendItem>
            </CalendarLegend>
          </CalendarHeader>

          <CalendarGrid>
            <CalendarDaysHeader>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <CalendarDayHeader key={day}>{day}</CalendarDayHeader>
              ))}
            </CalendarDaysHeader>
            
            <CalendarDays>
              {calendarDays.map((day, index) => {
                const isCurrentMonth = day.getMonth() === currentMonth;
                const isUnavailable = isDateUnavailable(day);
                const isTodayDate = isToday(day);
                const unavailableInfo = getUnavailableDateInfo(day);

                return (
                  <CalendarDay
                    key={index}
                    $isCurrentMonth={isCurrentMonth}
                    $isUnavailable={isUnavailable}
                    $isToday={isTodayDate}
                    onClick={() => handleCalendarClick(day)}
                  >
                    <DayNumber $isCurrentMonth={isCurrentMonth} $isToday={isTodayDate}>
                      {day.getDate()}
                    </DayNumber>
                    {isUnavailable && (
                      <UnavailableIndicator title={unavailableInfo?.reason}>
                        {unavailableInfo?.type === 'half-day' ? '½' : '●'}
                      </UnavailableIndicator>
                    )}
                  </CalendarDay>
                );
              })}
            </CalendarDays>
          </CalendarGrid>
        </CalendarPanel>

        {/* Leave List Panel */}
        <LeaveListPanel>
          <ListHeader>
            <ListTitle>Leave Schedule</ListTitle>
            <ListControls>
              <SearchInput
                type="text"
                placeholder="Search leaves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'upcoming' | 'past')}
              >
                <option value="all">All Leaves</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </FilterSelect>
              <FilterSelect
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              >
                <option value="all">All Types</option>
                {dayTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </FilterSelect>
            </ListControls>
          </ListHeader>

          {selectedDates.length > 0 && (
            <BulkActions>
              <BulkInfo>{selectedDates.length} selected</BulkInfo>
              <BulkButton 
                onClick={handleBulkRemove}
                disabled={deleteUnavailableDates.isPending}
              >
                <FiTrash size={14} />
                {deleteUnavailableDates.isPending ? 'Removing...' : 'Remove Selected'}
              </BulkButton>
              <BulkButton onClick={() => setSelectedDates([])}>
                Clear Selection
              </BulkButton>
            </BulkActions>
          )}

          <LeaveList>
            {filteredUnavailableDates.length === 0 ? (
              <EmptyState>
                <EmptyIcon>📅</EmptyIcon>
                <EmptyTitle>No Leaves Found</EmptyTitle>
                <EmptyMessage>
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'No leaves match your current filters.'
                    : 'You have no unavailable dates scheduled.'}
                </EmptyMessage>
              </EmptyState>
            ) : (
              filteredUnavailableDates.map(leave => (
                <LeaveItem key={leave.id} $isPast={isPastDate(leave.date)}>
                  <LeaveCheckbox
                    type="checkbox"
                    checked={selectedDates.includes(leave.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDates(prev => [...prev, leave.id]);
                      } else {
                        setSelectedDates(prev => prev.filter(id => id !== leave.id));
                      }
                    }}
                  />
                  
                  <LeaveInfo>
                    <LeaveDate>
                      {formatDateLong(leave.date)}
                      {isPastDate(leave.date) && <PastBadge>Past</PastBadge>}
                    </LeaveDate>
                    <LeaveReason>{leave.reason}</LeaveReason>
                    <LeaveDetails>
                      <LeaveType>{dayTypes.find(t => t.value === leave.type)?.label}</LeaveType>
                      {leave.notes && <LeaveNotes>• {leave.notes}</LeaveNotes>}
                    </LeaveDetails>
                    <LeaveCreated>
                      Added {formatDate(leave.createdAt)}
                    </LeaveCreated>
                  </LeaveInfo>

                  <LeaveActions>
                    <ActionButton
                      $variant="danger"
                      onClick={() => handleRemoveDate(leave.id, leave.reason)}
                      title="Remove leave"
                      disabled={deleteUnavailableDates.isPending}
                    >
                      <FiTrash size={14} />
                    </ActionButton>
                  </LeaveActions>
                </LeaveItem>
              ))
            )}
          </LeaveList>
        </LeaveListPanel>
      </ContentGrid>

      {/* Add Leave Modal */}
      {showAddModal && (
        <AddLeaveModal
          selectedDate={selectedDate}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(null);
          }}
          onAdd={handleAddLeave}
          isSubmitting={createUnavailableDateRange.isPending}
          leaveTypes={leaveTypes}
          dayTypes={dayTypes}
        />
      )}
    </Container>
  );
};

// Add Leave Modal Component
const AddLeaveModal: React.FC<AddLeaveModalProps> = ({ 
  selectedDate, 
  onClose, 
  onAdd, 
  isSubmitting, 
  leaveTypes, 
  dayTypes 
}) => {
  const [formData, setFormData] = useState<AddUnavailableDateRangePayload>({
    startDate: selectedDate ? formatDateToLocal(selectedDate) : '',
    endDate: selectedDate ? formatDateToLocal(selectedDate) : '',
    reason: 'Personal Leave',
    type: 'full-day',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleInputChange = (field: keyof AddUnavailableDateRangePayload, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add Unavailable Date(s)</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalForm onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <FormLabel>Start Date</FormLabel>
              <FormInput
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>End Date</FormLabel>
              <FormInput
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate}
                required
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <FormLabel>Leave Type</FormLabel>
              <FormSelect
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                required
              >
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup>
              <FormLabel>Duration</FormLabel>
              <FormSelect
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as AddUnavailableDateRangePayload['type'])}
                required
              >
                {dayTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormTextarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional details about this leave..."
              rows={3}
            />
          </FormGroup>

          <ModalActions>
            <CancelButton type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Leave'}
            </SubmitButton>
          </ModalActions>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
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

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 8px;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const QuickModeToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const QuickModeCheckbox = styled.input`
  width: 16px;
  height: 16px;
`;

const QuickModeLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const AddLeaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CalendarPanel = styled.div`
  background: #f8fafc;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 8px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid ${theme.colors.lightGray};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const CalendarNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: white;
  color: ${theme.colors.textPrimary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  }
`;

const MonthTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
  min-width: 180px;
  text-align: center;
`;

const CalendarLegend = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const CalendarGrid = styled.div`
  padding: 20px;
`;

const CalendarDaysHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 8px;
`;

const CalendarDayHeader = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  padding: 8px 4px;
`;

const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${theme.colors.lightGray};
  border-radius: 6px;
  overflow: hidden;
`;

const CalendarDay = styled.div<{
  $isCurrentMonth: boolean;
  $isUnavailable: boolean;
  $isToday: boolean;
}>`
  aspect-ratio: 1;
  background: ${props => 
    !props.$isCurrentMonth ? '#f3f4f6' :
    props.$isToday ? theme.colors.primary + '20' :
    'white'
  };
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: ${props => props.$isCurrentMonth ? 'pointer' : 'default'};
  transition: all 0.2s;
  border: ${props => props.$isToday ? `2px solid ${theme.colors.primary}` : 'none'};

  &:hover {
    background: ${props => 
      props.$isCurrentMonth ? (props.$isToday ? theme.colors.primary + '30' : '#f9fafb') : '#f3f4f6'
    };
  }
`;

const DayNumber = styled.div<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
}>`
  font-size: 14px;
  font-weight: ${props => props.$isToday ? '600' : '500'};
  color: ${props => 
    !props.$isCurrentMonth ? '#9ca3af' :
    props.$isToday ? theme.colors.primary :
    theme.colors.textPrimary
  };
`;

const UnavailableIndicator = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: ${theme.colors.danger};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 600;
`;

const LeaveListPanel = styled.div`
  background: white;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ListHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.lightGray};
  background: #f8fafc;
`;

const ListTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 16px 0;
`;

const ListControls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${theme.colors.lightGray};
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

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${theme.colors.primary}10;
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

const BulkInfo = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  flex: 1;
`;

const BulkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    color: ${theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LeaveList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
`;

const LeaveItem = styled.div<{ $isPast: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${theme.colors.lightGray};
  transition: all 0.2s;
  opacity: ${props => props.$isPast ? 0.7 : 1};

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LeaveCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const LeaveInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LeaveDate = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PastBadge = styled.span`
  padding: 2px 6px;
  background: ${theme.colors.textSecondary}20;
  color: ${theme.colors.textSecondary};
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
`;

const LeaveReason = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  margin-bottom: 4px;
`;

const LeaveDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const LeaveType = styled.span`
  padding: 2px 6px;
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  border-radius: 4px;
  font-weight: 500;
`;

const LeaveNotes = styled.span``;

const LeaveCreated = styled.div`
  font-size: 11px;
  color: ${theme.colors.textSecondary};
`;

const LeaveActions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ActionButton = styled.button<{ $variant: string }>`
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => 
    props.$variant === 'danger' ? '#fee2e2' : '#e0f2fe'
  };
  color: ${props => 
    props.$variant === 'danger' ? theme.colors.danger : '#0369a1'
  };

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0;
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  color: ${theme.colors.textSecondary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: ${theme.colors.textPrimary};
  }
`;

const ModalForm = styled.form`
  padding: 24px;
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

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin-bottom: 6px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.lightGray};
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f9fafb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Loading and Error Components
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
  border: 3px solid ${theme.colors.lightGray};
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
  color: ${theme.colors.textSecondary};
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
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.danger};
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 16px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

export default DoctorUnavailableDays;