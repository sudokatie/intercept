import { City } from '../game/City';

describe('City', () => {
  let city: City;

  beforeEach(() => {
    city = new City(0, 100);
  });

  describe('constructor', () => {
    it('should set id correctly', () => {
      expect(city.id).toBe(0);
    });

    it('should set x position correctly', () => {
      expect(city.x).toBe(100);
    });

    it('should start alive', () => {
      expect(city.alive).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should set alive to false', () => {
      city.destroy();
      expect(city.alive).toBe(false);
    });

    it('should be idempotent', () => {
      city.destroy();
      city.destroy();
      expect(city.alive).toBe(false);
    });
  });

  describe('reset', () => {
    it('should set alive to true', () => {
      city.destroy();
      city.reset();
      expect(city.alive).toBe(true);
    });
  });

  describe('getData', () => {
    it('should return correct data', () => {
      const data = city.getData();
      expect(data.id).toBe(0);
      expect(data.x).toBe(100);
      expect(data.alive).toBe(true);
    });

    it('should reflect destroyed state', () => {
      city.destroy();
      expect(city.getData().alive).toBe(false);
    });
  });
});
