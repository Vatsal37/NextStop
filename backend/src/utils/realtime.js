let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitAirportsUpdated = () => {
  if (ioInstance) {
    ioInstance.emit('airports:updated');
  }
};

export const emitFlightScheduled = (payload) => {
  if (ioInstance) {
    ioInstance.emit('flights:scheduled', payload || {});
  }
};


