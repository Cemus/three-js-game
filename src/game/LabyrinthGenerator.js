export default class LabyrinthGenerator {
  constructor() {
    this.labyrinth = [
      {
        name: "entranceRoom",
        index: 0,
        doorCount: 3,
        itemSlots: [...Array(5)].fill(null),
      },
      {
        name: "laundryRoom",
        index: 1,
        doorCount: 3,
        itemSlots: [...Array(4).fill(null)],
      },
      {
        name: "garageRoom",
        index: 2,
        doorCount: 1,
        itemSlots: [...Array(6).fill(null)],
      },
    ];

    this.LOneItemList = [
      new Item("smallHeal", 1),
      new Item("key", 1),
      new Item("key", 1),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
      new Item("nambu14", Math.floor(Math.random * (8 - 1 + 1) + 1)),
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
          roomData.name,
          roomData.index,
          roomData.doorCount,
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
        allItemSlots.push({ index: room.index, slotIndex: i });
      }
    }

    const shuffledItemSlots = this.shuffle(allItemSlots);

    for (const { index, slotIndex } of shuffledItemSlots) {
      const room = rooms[index];
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
  constructor(name, index, doorCount, itemSlots) {
    this.name = name;
    this.index = index;
    this.doorCount = doorCount;
    this.itemSlots = itemSlots;
    this.connectedDoors = {};
  }

  connectDoor(currentDoor, nextRoom, nextDoor) {
    this.connectedDoors[currentDoor] = {
      nextRoomIndex: nextRoom.index,
      nextDoor: nextDoor,
    };
  }
}

class Item {
  static itemCount = 0;
  constructor(name, amount) {
    this.name = name;
    this.amount = amount;
    this.index = Item.itemCount++;
    this.uuid = null;
    this.pickedUp = false;
  }
}
