export type Role = 'resident' | 'provider';

export interface RoomContext {
  roomId: string;
  myRole: Role;
  myId: string;
  otherPartyId: string;
  otherPartyName: string;
}