export default class LabyrinthGenerator {
  constructor() {
    this.labyrinth = [
      {
        roomIndex: 0,
        doorCount: 3,
        roomURL: `../../assets/rooms/entranceRoom.gltf`,
      },
      {
        roomIndex: 1,
        doorCount: 3,
        roomURL: `../../assets/rooms/laundryRoom.gltf`,
      },
      {
        roomIndex: 2,
        doorCount: 1,
        roomURL: `../../assets/rooms/garageRoom.gltf`,
      },
    ];
  }

  createRoomsAndShuffle() {
    const rooms = this.labyrinth.map(
      (roomData) =>
        new Room(roomData.roomIndex, roomData.doorCount, roomData.roomURL)
    );
    for (let i = rooms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rooms[i], rooms[j]] = [rooms[j], rooms[i]];
    }
    console.log(rooms);
    return rooms;
  }
  async init() {
    const rooms = this.createRoomsAndShuffle();
    for (let i = 0; i < rooms.length - 1; i++) {
      const currentRoom = rooms[i];
      const nextRoom = rooms[i + 1];

      const currentDoor = Math.floor(Math.random() * currentRoom.doorCount) + 1;
      const nextDoor = Math.floor(Math.random() * nextRoom.doorCount) + 1;

      currentRoom.connectDoor(currentDoor, nextRoom, nextDoor);
      nextRoom.connectDoor(nextDoor, currentRoom, currentDoor);
    }

    return rooms;
  }
}

class Room {
  constructor(roomIndex, doorCount, roomURL) {
    this.roomIndex = roomIndex;
    this.doorCount = doorCount;
    this.roomURL = roomURL;
    this.connectedDoors = {};

    /*     for (let i = 0; i < doorCount; i++) {
      this.connectedDoors[i] = { room: "jammed", door: "jammed" };
    } */
  }

  connectDoor(currentDoor, nextRoom, nextDoor) {
    this.connectedDoors[currentDoor] = {
      room: nextRoom.roomIndex,
      door: nextDoor,
    };
  }
}
