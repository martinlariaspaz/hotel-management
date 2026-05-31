export type NightlyStayWindow = {
  checkIn: Date;
  checkOut: Date;
};

export function doNightlyStaysOverlap(
  firstStay: NightlyStayWindow,
  secondStay: NightlyStayWindow,
): boolean {
  return (
    firstStay.checkIn < secondStay.checkOut &&
    firstStay.checkOut > secondStay.checkIn
  );
}

export default doNightlyStaysOverlap;
