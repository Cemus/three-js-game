export default class LabyrinthGenerator {
  constructor() {
    this.labyrinth = [
      {
        roomIndex: 0,
        doorCount: 3,
        roomURL: `../../assets/rooms/entranceRoom.gltf`,
        itemSlots: [...Array(5)].fill(null),
      },
      {
        roomIndex: 1,
        doorCount: 3,
        roomURL: `../../assets/rooms/laundryRoom.gltf`,
        itemSlots: [...Array(4).fill(null)],
      },
      {
        roomIndex: 2,
        doorCount: 1,
        roomURL: `../../assets/rooms/garageRoom.gltf`,
        itemSlots: [...Array(6).fill(null)],
      },
    ];
    this.LOneItemList = [
      "smallHeal",
      "smallHeal",
      "key",
      "smallHeal",
      "smallHeal",
      "key",
    ];
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  createRoomsAndShuffle() {
    const rooms = this.labyrinth.map(
      (roomData) =>
        new Room(
          roomData.roomIndex,
          roomData.doorCount,
          roomData.roomURL,
          roomData.itemSlots
        )
    );

    return this.shuffle(rooms);
  }

  async init() {
    const rooms = this.createRoomsAndShuffle();
    for (let i = 0; i < rooms.length - 1; i++) {
      const currentRoom = rooms[i];
      const nextRoom = rooms[i + 1];

      const currentDoor = Math.floor(Math.random() * currentRoom.doorCount);
      const nextDoor = Math.floor(Math.random() * nextRoom.doorCount);

      currentRoom.connectDoor(currentDoor, nextRoom, nextDoor);
      nextRoom.connectDoor(nextDoor, currentRoom, currentDoor);
    }
    this.distributeItems(rooms, this.LOneItemList);
    return rooms;
  }
  distributeItems(rooms, itemList) {
    let itemsDistributed = 0;
    const allItemSlots = [];

    for (const room of rooms) {
      for (let i = 0; i < room.itemSlots.length; i++) {
        allItemSlots.push({ roomIndex: room.roomIndex, slotIndex: i });
      }
    }

    const shuffledItemSlots = this.shuffle(allItemSlots);

    for (const { roomIndex, slotIndex } of shuffledItemSlots) {
      const room = rooms[roomIndex];
      if (itemsDistributed < itemList.length) {
        room.itemSlots[slotIndex] = itemList[itemsDistributed];
        itemsDistributed++;
      } else {
        break;
      }
    }
  }
}
class Room {
  constructor(roomIndex, doorCount, roomURL, itemSlots) {
    this.roomIndex = roomIndex;
    this.doorCount = doorCount;
    this.roomURL = roomURL;
    this.itemSlots = itemSlots;
    this.connectedDoors = {};
  }

  connectDoor(currentDoor, nextRoom, nextDoor) {
    this.connectedDoors[currentDoor] = {
      nextRoomIndex: nextRoom.roomIndex,
      nextDoor: nextDoor,
    };
  }
}
