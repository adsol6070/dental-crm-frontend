// @ts-nocheck
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FiClock,
  FiCalendar,
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiPlus,
  FiTrash,
  FiEdit,
  FiToggleLeft,
  FiToggleRight,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiCopy,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import {
  useAddBreakTime,
  useDoctorSchedule,
  useRemoveBreakTime,
  useUpdateAvailability,
  useUpdateSchedule,
} from "@/hooks/useDoctor";

// Theme configuration
const theme = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    white: "#ffffff",
    primaryDark: "#4f46e5",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    lightGray: "#e5e7eb",
  },
};

const useMonthlyCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMonthlyCalendar = async (month, year) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock calendar data
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstDay = new Date(year, month - 1, 1).getDay();
      const calendar = [];

      for (let i = 1; i <= daysInMonth; i++) {
        calendar.push({
          date: i,
          appointmentCount: Math.floor(Math.random() * 8),
          isAvailable: Math.random() > 0.2,
          isToday:
            i === new Date().getDate() &&
            month === new Date().getMonth() + 1 &&
            year === new Date().getFullYear(),
        });
      }

      setCalendarData({
        calendar,
        month,
        year,
        firstDay,
        monthName: new Date(year, month - 1).toLocaleString("default", {
          month: "long",
        }),
      });
    } catch (error) {
      console.error("Failed to load calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { calendarData, isLoading, loadMonthlyCalendar };
};

const DoctorSchedule = () => {
  const { mutate: addBreakTime, isPending } = useAddBreakTime();
  const { data: scheduleData, isLoading } = useDoctorSchedule();
  const { mutate: removeBreakTime, isPending: isRemovingBreakTime } =
    useRemoveBreakTime();
  const { mutate: updateAvailability } = useUpdateAvailability();
  const { mutate: updateSchedule } = useUpdateSchedule();

  const {
    calendarData,
    isLoading: calendarLoading,
    loadMonthlyCalendar,
  } = useMonthlyCalendar();

  // Local state
  const [activeView, setActiveView] = useState("weekly"); // 'weekly' or 'monthly'
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [localSchedule, setLocalSchedule] = useState([]);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Load calendar on mount and when month/year changes
  useEffect(() => {
    loadMonthlyCalendar(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  // Initialize local schedule when data loads
  useEffect(() => {
    if (scheduleData?.data.schedule?.workingDays) {
      setLocalSchedule([...scheduleData?.data.schedule?.workingDays]);
    }
  }, [scheduleData]);

  const daysOfWeek = [
    { key: "monday", label: "Monday", short: "Mon" },
    { key: "tuesday", label: "Tuesday", short: "Tue" },
    { key: "wednesday", label: "Wednesday", short: "Wed" },
    { key: "thursday", label: "Thursday", short: "Thu" },
    { key: "friday", label: "Friday", short: "Fri" },
    { key: "saturday", label: "Saturday", short: "Sat" },
    { key: "sunday", label: "Sunday", short: "Sun" },
  ];

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const formatTime = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleDayToggle = (dayKey) => {
    if (!editingSchedule) return;

    setLocalSchedule((prev) =>
      prev.map((day) =>
        day.day === dayKey ? { ...day, isWorking: !day.isWorking } : day
      )
    );
  };

  const handleTimeChange = (dayKey, field, value) => {
    if (!editingSchedule) return;

    setLocalSchedule((prev) =>
      prev.map((day) => (day.day === dayKey ? { ...day, [field]: value } : day))
    );
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      const schedulePayload = {
        workingDays: localSchedule, 
        slotDuration: 30, 
        breakTimes: [],
      };

      await updateSchedule(schedulePayload);
      setEditingSchedule(false);
      Swal.fire({
        title: "Success!",
        text: "Schedule updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update schedule. Please try again.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setLocalSchedule([...scheduleData?.data.schedule?.workingDays]);
    setEditingSchedule(false);
  };

  const handleAvailabilityToggle = async () => {
    const newStatus = !scheduleData?.data.schedule.availability.isAvailable;
    try {
      await updateAvailability({ isAvailable: newStatus });
      Swal.fire({
        title: "Success!",
        text: `You are now ${newStatus ? "Available" : "Unavailable"}.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to update availability. Please try again.",
        icon: "error",
      });
    }
  };

  const handleAddBreak = async (breakData) => {
    try {
      await addBreakTime(breakData);
      setShowBreakModal(false);
      Swal.fire({
        title: "Success!",
        text: "Break time added successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to add break time. Please try again.",
        icon: "error",
      });
    }
  };

  const handleRemoveBreak = async (breakId, breakTitle) => {
    const result = await Swal.fire({
      title: `Remove "${breakTitle}"?`,
      text: "This break time will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    });

    if (result.isConfirmed) {
      try {
        await removeBreakTime(breakId);
        Swal.fire({
          title: "Removed!",
          text: "Break time has been removed.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Failed to remove break time. Please try again.",
          icon: "error",
        });
      }
    }
  };

  const handleCopySchedule = async (fromDay, toDay) => {
    const sourceDay = localSchedule.find((day) => day.day === fromDay);
    if (!sourceDay) return;

    setLocalSchedule((prev) =>
      prev.map((day) =>
        day.day === toDay
          ? {
              ...day,
              startTime: sourceDay.startTime,
              endTime: sourceDay.endTime,
              isWorking: sourceDay.isWorking,
            }
          : day
      )
    );
  };

  const getBreaksForDay = (dayKey) => {
    return (
      scheduleData?.data.schedule?.breakTimes?.filter(
        (br) => br.day === dayKey
      ) || []
    );
  };

  const handleMonthNavigation = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendarGrid = () => {
    if (!calendarData) return null;

    const { calendar, firstDay, monthName } = calendarData;
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<CalendarDay key={`empty-${i}`} isEmpty />);
    }

    // Add days of the month
    calendar.forEach((day) => {
      calendarDays.push(
        <CalendarDay
          key={day.date}
          isToday={day.isToday}
          isAvailable={day.isAvailable}
        >
          <CalendarDate>{day.date}</CalendarDate>
          <CalendarInfo>
            <AppointmentCount>{day.appointmentCount} apt</AppointmentCount>
            <AvailabilityDot available={day.isAvailable} />
          </CalendarInfo>
        </CalendarDay>
      );
    });

    return calendarDays;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading schedule...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  // if (error) {
  //   return (
  //     <Container>
  //       <ErrorContainer>
  //         <ErrorIcon>⚠️</ErrorIcon>
  //         <ErrorTitle>Failed to Load Schedule</ErrorTitle>
  //         <ErrorMessage>
  //           Unable to load your schedule data. Please try again.
  //         </ErrorMessage>
  //         <RetryButton onClick={refetch}>
  //           <FiRefreshCw size={16} />
  //           Try Again
  //         </RetryButton>
  //       </ErrorContainer>
  //     </Container>
  //   );
  // }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderContent>
          <Title>Schedule Management</Title>
          <Subtitle>
            Manage your working hours, availability, and break times
          </Subtitle>
          <AvailabilityStatus>
            <StatusIndicator
              available={scheduleData?.data.schedule.availability.isAvailable}
            >
              <StatusDot
                available={scheduleData?.data.schedule.availability.isAvailable}
              />
              {scheduleData?.availability?.currentStatus}
            </StatusIndicator>
            <ToggleButton onClick={handleAvailabilityToggle}>
              {scheduleData?.data.schedule.availability.isAvailable ? (
                <FiToggleRight size={20} />
              ) : (
                <FiToggleLeft size={20} />
              )}
              Quick Toggle
            </ToggleButton>
          </AvailabilityStatus>
        </HeaderContent>
        <HeaderActions>
          <ViewToggle>
            <ViewButton
              active={activeView === "weekly"}
              onClick={() => setActiveView("weekly")}
            >
              <FiList size={16} />
              Weekly
            </ViewButton>
            <ViewButton
              active={activeView === "monthly"}
              onClick={() => setActiveView("monthly")}
            >
              <FiGrid size={16} />
              Monthly
            </ViewButton>
          </ViewToggle>
          <RefreshButton onClick={() => {}}>
            <FiRefreshCw size={16} />
            Refresh
          </RefreshButton>
        </HeaderActions>
      </Header>

      <ContentWrapper>
        {activeView === "weekly" ? (
          <WeeklyView>
            {/* Weekly Schedule Controls */}
            <ScheduleControls>
              <ControlsLeft>
                <EditButton
                  active={editingSchedule}
                  onClick={() => setEditingSchedule(!editingSchedule)}
                >
                  <FiEdit size={16} />
                  {editingSchedule ? "Cancel Edit" : "Edit Schedule"}
                </EditButton>
                {editingSchedule && (
                  <>
                    <SaveButton
                      onClick={handleSaveSchedule}
                      disabled={isSaving}
                    >
                      <FiSave size={16} />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </SaveButton>
                    <CancelButton onClick={handleCancelEdit}>
                      Cancel
                    </CancelButton>
                  </>
                )}
              </ControlsLeft>
              <ControlsRight>
                <AddBreakButton onClick={() => setShowBreakModal(true)}>
                  <FiPlus size={16} />
                  Add Break
                </AddBreakButton>
              </ControlsRight>
            </ScheduleControls>

            {/* Weekly Schedule Grid */}
            <ScheduleGrid>
              {daysOfWeek.map(({ key, label, short }) => {
                const daySchedule = localSchedule.find((d) => d.day === key);
                const dayBreaks = getBreaksForDay(key);

                return (
                  <DayCard key={key} isWorking={daySchedule?.isWorking}>
                    <DayHeader>
                      <DayName>{label}</DayName>
                      <DayToggle>
                        <ToggleSwitch
                          checked={daySchedule?.isWorking}
                          onChange={() => handleDayToggle(key)}
                          disabled={!editingSchedule}
                        />
                        <ToggleLabel>
                          {daySchedule?.isWorking ? "Working" : "Off"}
                        </ToggleLabel>
                      </DayToggle>
                    </DayHeader>

                    {daySchedule?.isWorking && (
                      <DayContent>
                        <TimeInputs>
                          <TimeGroup>
                            <TimeLabel>Start Time</TimeLabel>
                            <TimeInput
                              type="time"
                              value={daySchedule.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  key,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              disabled={!editingSchedule}
                            />
                          </TimeGroup>
                          <TimeGroup>
                            <TimeLabel>End Time</TimeLabel>
                            <TimeInput
                              type="time"
                              value={daySchedule.endTime}
                              onChange={(e) =>
                                handleTimeChange(key, "endTime", e.target.value)
                              }
                              disabled={!editingSchedule}
                            />
                          </TimeGroup>
                        </TimeInputs>

                        <WorkingHours>
                          {formatTime(daySchedule.startTime)} -{" "}
                          {formatTime(daySchedule.endTime)}
                        </WorkingHours>

                        {/* Break Times */}
                        {dayBreaks.length > 0 && (
                          <BreaksSection>
                            <BreakTitle>Breaks</BreakTitle>
                            {dayBreaks.map((breakTime) => (
                              <BreakItem key={breakTime.id}>
                                <BreakInfo>
                                  <BreakName>{breakTime.title}</BreakName>
                                  <BreakTime>
                                    {formatTime(breakTime.startTime)} -{" "}
                                    {formatTime(breakTime.endTime)}
                                  </BreakTime>
                                </BreakInfo>
                                <RemoveBreakButton
                                  onClick={() =>
                                    handleRemoveBreak(
                                      breakTime.id,
                                      breakTime.title
                                    )
                                  }
                                >
                                  <FiTrash size={12} />
                                </RemoveBreakButton>
                              </BreakItem>
                            ))}
                          </BreaksSection>
                        )}

                        {editingSchedule && (
                          <DayActions>
                            <CopyButton onClick={() => setSelectedDay(key)}>
                              <FiCopy size={12} />
                              Copy to...
                            </CopyButton>
                          </DayActions>
                        )}
                      </DayContent>
                    )}

                    {!daySchedule?.isWorking && (
                      <OffDayMessage>Not working this day</OffDayMessage>
                    )}
                  </DayCard>
                );
              })}
            </ScheduleGrid>
          </WeeklyView>
        ) : (
          <MonthlyView>
            {/* Monthly Calendar Controls */}
            <CalendarControls>
              <CalendarNavigation>
                <NavButton onClick={() => handleMonthNavigation("prev")}>
                  <FiChevronLeft size={18} />
                </NavButton>
                <MonthTitle>
                  {calendarData?.monthName} {currentYear}
                </MonthTitle>
                <NavButton onClick={() => handleMonthNavigation("next")}>
                  <FiChevronRight size={18} />
                </NavButton>
              </CalendarNavigation>
              <CalendarLegend>
                <LegendItem>
                  <AvailabilityDot available={true} />
                  Available
                </LegendItem>
                <LegendItem>
                  <AvailabilityDot available={false} />
                  Unavailable
                </LegendItem>
              </CalendarLegend>
            </CalendarControls>

            {/* Calendar Grid */}
            <CalendarContainer>
              <CalendarHeader>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <CalendarHeaderDay key={day}>{day}</CalendarHeaderDay>
                  )
                )}
              </CalendarHeader>
              <CalendarGrid>
                {calendarLoading ? (
                  <CalendarLoadingContainer>
                    <LoadingSpinner />
                  </CalendarLoadingContainer>
                ) : (
                  renderCalendarGrid()
                )}
              </CalendarGrid>
            </CalendarContainer>
          </MonthlyView>
        )}
      </ContentWrapper>

      {/* Add Break Modal */}
      {showBreakModal && (
        <BreakModal
          onClose={() => setShowBreakModal(false)}
          onAdd={handleAddBreak}
        />
      )}

      {/* Copy Schedule Modal */}
      {selectedDay && (
        <CopyScheduleModal
          sourceDay={selectedDay}
          onClose={() => setSelectedDay("")}
          onCopy={handleCopySchedule}
          daysOfWeek={daysOfWeek}
        />
      )}
    </Container>
  );
};

// Break Modal Component
const BreakModal = ({ onClose, onAdd }) => {
  const [breakData, setBreakData] = useState({
    day: "monday",
    startTime: "13:00",
    endTime: "14:00",
    title: "Lunch Break",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(breakData);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add Break Time</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Day</FormLabel>
            <FormSelect
              value={breakData.day}
              onChange={(e) =>
                setBreakData((prev) => ({ ...prev, day: e.target.value }))
              }
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </FormSelect>
          </FormGroup>
          <FormRow>
            <FormGroup>
              <FormLabel>Start Time</FormLabel>
              <FormInput
                type="time"
                value={breakData.startTime}
                onChange={(e) =>
                  setBreakData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>End Time</FormLabel>
              <FormInput
                type="time"
                value={breakData.endTime}
                onChange={(e) =>
                  setBreakData((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </FormGroup>
          </FormRow>
          <FormGroup>
            <FormLabel>Break Title</FormLabel>
            <FormInput
              type="text"
              value={breakData.title}
              onChange={(e) =>
                setBreakData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Lunch Break, Coffee Break"
            />
          </FormGroup>
          <ModalActions>
            <CancelModalButton type="button" onClick={onClose}>
              Cancel
            </CancelModalButton>
            <SubmitButton type="submit">Add Break</SubmitButton>
          </ModalActions>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
  );
};

// Copy Schedule Modal Component
const CopyScheduleModal = ({ sourceDay, onClose, onCopy, daysOfWeek }) => {
  const [targetDay, setTargetDay] = useState("");

  const handleCopy = () => {
    if (targetDay) {
      onCopy(sourceDay, targetDay);
      onClose();
    }
  };

  const sourceDayLabel = daysOfWeek.find((d) => d.key === sourceDay)?.label;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Copy Schedule</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <CopyMessage>
            Copy schedule from <strong>{sourceDayLabel}</strong> to:
          </CopyMessage>
          <FormGroup>
            <FormLabel>Target Day</FormLabel>
            <FormSelect
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
            >
              <option value="">Select a day</option>
              {daysOfWeek
                .filter((d) => d.key !== sourceDay)
                .map((day) => (
                  <option key={day.key} value={day.key}>
                    {day.label}
                  </option>
                ))}
            </FormSelect>
          </FormGroup>
        </ModalBody>
        <ModalActions>
          <CancelModalButton onClick={onClose}>Cancel</CancelModalButton>
          <SubmitButton onClick={handleCopy} disabled={!targetDay}>
            Copy Schedule
          </SubmitButton>
        </ModalActions>
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
  margin: 0 0 12px 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const AvailabilityStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.available ? theme.colors.success : theme.colors.danger};
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${(props) =>
    props.active ? "rgba(255, 255, 255, 0.2)" : "transparent"};
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
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

const ContentWrapper = styled.div`
  padding: 24px;
`;

const WeeklyView = styled.div``;

const ScheduleControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${theme.colors.lightGray};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const ControlsLeft = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ControlsRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) => (props.active ? theme.colors.primary : "white")};
  color: ${(props) => (props.active ? "white" : theme.colors.primary)};
  border: 1px solid ${theme.colors.primary};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.active ? theme.colors.primaryDark : theme.colors.primary + "10"};
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${theme.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  background: white;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const AddBreakButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${theme.colors.warning};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d97706;
  }
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DayCard = styled.div`
  background: ${(props) => (props.isWorking ? "white" : "#f9fafb")};
  border: 1px solid
    ${(props) => (props.isWorking ? theme.colors.lightGray : "#e5e7eb")};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${(props) => (props.isWorking ? "#f8fafc" : "#f3f4f6")};
  border-bottom: 1px solid ${theme.colors.lightGray};
`;

const DayName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const DayToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleSwitch = styled.input.attrs({ type: "checkbox" })`
  width: 40px;
  height: 20px;
  appearance: none;
  background: ${(props) => (props.checked ? theme.colors.success : "#d1d5db")};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${(props) => (props.checked ? "22px" : "2px")};
    transition: all 0.2s;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
`;

const DayContent = styled.div`
  padding: 16px;
`;

const TimeInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const TimeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textSecondary};
`;

const TimeInput = styled.input`
  padding: 8px 10px;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &:disabled {
    background: #f9fafb;
    color: ${theme.colors.textSecondary};
  }
`;

const WorkingHours = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.primary};
  background: ${theme.colors.primary}10;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 12px;
`;

const BreaksSection = styled.div`
  margin-top: 16px;
`;

const BreakTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 8px 0;
`;

const BreakItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: ${theme.colors.warning}10;
  border-radius: 4px;
  margin-bottom: 4px;
`;

const BreakInfo = styled.div`
  flex: 1;
`;

const BreakName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const BreakTime = styled.div`
  font-size: 11px;
  color: ${theme.colors.textSecondary};
`;

const RemoveBreakButton = styled.button`
  padding: 4px;
  background: transparent;
  color: ${theme.colors.danger};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.danger}20;
  }
`;

const DayActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.lightGray};
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: white;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    color: ${theme.colors.textPrimary};
  }
`;

const OffDayMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-style: italic;
`;

const MonthlyView = styled.div``;

const CalendarControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
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
    background: #f9fafb;
    border-color: ${theme.colors.primary};
  }
`;

const MonthTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
  min-width: 200px;
  text-align: center;
`;

const CalendarLegend = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const AvailabilityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.available ? theme.colors.success : theme.colors.danger};
`;

const CalendarContainer = styled.div`
  background: white;
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 8px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
`;

const CalendarHeaderDay = styled.div`
  padding: 12px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  border-right: 1px solid ${theme.colors.lightGray};

  &:last-child {
    border-right: none;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
`;

const CalendarDay = styled.div`
  aspect-ratio: 1;
  padding: 8px;
  border-right: 1px solid ${theme.colors.lightGray};
  border-bottom: 1px solid ${theme.colors.lightGray};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${(props) =>
    props.isEmpty
      ? "transparent"
      : props.isToday
      ? theme.colors.primary + "10"
      : props.isAvailable
      ? "white"
      : "#fef2f2"};
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.isEmpty
        ? "transparent"
        : props.isToday
        ? theme.colors.primary + "20"
        : "#f9fafb"};
  }

  &:nth-child(7n) {
    border-right: none;
  }
`;

const CalendarDate = styled.div`
  font-size: 14px;
  font-weight: ${(props) => (props.isToday ? "600" : "500")};
  color: ${(props) =>
    props.isToday ? theme.colors.primary : theme.colors.textPrimary};
`;

const CalendarInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AppointmentCount = styled.div`
  font-size: 10px;
  color: ${theme.colors.textSecondary};
`;

const CalendarLoadingContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
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

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const CancelModalButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: ${theme.colors.textSecondary};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const CopyMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  margin: 0 0 16px 0;
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

export default DoctorSchedule;
