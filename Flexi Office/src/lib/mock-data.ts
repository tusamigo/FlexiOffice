
export type ResourceStatus = 'Available' | 'Limited' | 'Full' | 'Maintenance';
export type ResourceType = 'Desk' | 'MeetingRoom' | 'Parking' | 'EVCharger';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  capacity?: number;
  location: { x: number; y: number };
}

export const RESOURCES: Resource[] = [
  { id: 'd1', name: 'Desk 101', type: 'Desk', status: 'Available', location: { x: 10, y: 10 } },
  { id: 'd2', name: 'Desk 102', type: 'Desk', status: 'Full', location: { x: 10, y: 25 } },
  { id: 'd3', name: 'Desk 103', type: 'Desk', status: 'Available', location: { x: 10, y: 40 } },
  { id: 'mr1', name: 'Boardroom A', type: 'MeetingRoom', status: 'Limited', capacity: 12, location: { x: 40, y: 10 } },
  { id: 'mr2', name: 'Studio B', type: 'MeetingRoom', status: 'Available', capacity: 4, location: { x: 40, y: 35 } },
  { id: 'p1', name: 'Slot P-01', type: 'Parking', status: 'Available', location: { x: 70, y: 10 } },
  { id: 'ev1', name: 'EV Station 1', type: 'EVCharger', status: 'Full', location: { x: 70, y: 25 } },
];

export const MOCK_USER = {
  id: 'user_123',
  name: 'Alex Rivers',
  role: 'Product Designer',
  commuteDistanceKm: 15.5,
  wfhStreak: 8,
  flexPoints: 1250,
  co2SavedKg: 42.8,
  commuteTimeSavedMin: 480,
};

export const TEAM_PRESENCE = [
  { employeeId: 'emp_001', name: 'Sarah J.', status: 'WFH', date: '2024-05-20' },
  { employeeId: 'emp_002', name: 'Mike D.', status: 'InOffice', date: '2024-05-20' },
  { employeeId: 'emp_003', name: 'Elena K.', status: 'WFH', date: '2024-05-20' },
  { employeeId: 'emp_004', name: 'James L.', status: 'InOffice', date: '2024-05-20' },
];

export const TEAM_MEETINGS = [
  {
    date: '2024-05-20',
    time: '10:00',
    title: 'Product Sync',
    attendees: ['user_123', 'emp_001', 'emp_002'],
    locationType: 'Hybrid',
    purpose: 'Weekly sync and roadmap review',
  },
  {
    date: '2024-05-20',
    time: '14:00',
    title: 'Design Review',
    attendees: ['user_123', 'emp_003'],
    locationType: 'Remote',
    purpose: 'Deep dive into new dashboard visuals',
  }
];
