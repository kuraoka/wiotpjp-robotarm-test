'use strict';

module.exports = function (buf) {
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04
   && buf[4] === 0x14 && buf[5] === 0x00 && buf[6] === 0x06 && buf[7] === 0x00) {
    return true;
  }

  return false;
};
