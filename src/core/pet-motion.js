'use strict';

const PET_PROFILES = Object.freeze({
  cat: Object.freeze({
    maxSpeed: 105,
    acceleration: 260,
    deceleration: 330,
    arrivalRadius: 7,
    wanderChance: 0.08,
    minWanderDistance: 90,
    maxWanderDistance: 430
  }),
  dog: Object.freeze({
    maxSpeed: 150,
    acceleration: 420,
    deceleration: 480,
    arrivalRadius: 9,
    wanderChance: 0.15,
    minWanderDistance: 130,
    maxWanderDistance: 650
  })
});

const ALLOWED_ACTIONS = new Set(['none', 'jump', 'walk', 'sleep', 'wag']);
const ALLOWED_EMOTIONS = new Set(['happy', 'calm', 'sleepy', 'sad', 'excited']);
const ALLOWED_SOUNDS = new Set(['none', 'meow', 'purr', 'bark', 'whine', 'sniff']);
// AI-decided movement intents. 'none' = no explicit intent, fallback to action.
const ALLOWED_INTENTS = new Set(['none', 'approach', 'retreat', 'play', 'sleep', 'wander', 'stay']);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function approach(current, target, maxDelta) {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return target;
}

function getPetProfile(petType) {
  return PET_PROFILES[petType] || PET_PROFILES.cat;
}

function normalizePetType(value) {
  return value === 'dog' ? 'dog' : 'cat';
}

function normalizePetAction(value) {
  const normalized = typeof value === 'string' ? value.toLowerCase() : 'none';
  return ALLOWED_ACTIONS.has(normalized) ? normalized : 'none';
}

function normalizeEmotion(value) {
  const normalized = typeof value === 'string' ? value.toLowerCase() : 'happy';
  return ALLOWED_EMOTIONS.has(normalized) ? normalized : 'happy';
}

function normalizePetSound(value) {
  const normalized = typeof value === 'string' ? value.toLowerCase() : 'none';
  return ALLOWED_SOUNDS.has(normalized) ? normalized : 'none';
}

function normalizeIntent(value) {
  const normalized = typeof value === 'string' ? value.toLowerCase() : 'none';
  return ALLOWED_INTENTS.has(normalized) ? normalized : 'none';
}

function calculateDesiredVelocity(distance, profile) {
  if (Math.abs(distance) <= profile.arrivalRadius) return 0;
  const brakingSpeed = Math.sqrt(2 * profile.deceleration * Math.abs(distance));
  return Math.sign(distance) * Math.min(profile.maxSpeed, brakingSpeed);
}

function stepMotion({ position, velocity, target, deltaSeconds, min, max, profile }) {
  const safeDelta = clamp(deltaSeconds, 0, 0.05);
  const distance = target - position;
  const desiredVelocity = calculateDesiredVelocity(distance, profile);
  const rate = Math.abs(desiredVelocity) < Math.abs(velocity)
    ? profile.deceleration
    : profile.acceleration;
  const nextVelocity = approach(velocity, desiredVelocity, rate * safeDelta);
  let nextPosition = clamp(position + nextVelocity * safeDelta, min, max);

  if ((distance > 0 && nextPosition > target) || (distance < 0 && nextPosition < target)) {
    nextPosition = target;
  }

  const remaining = target - nextPosition;
  const arrived = Math.abs(remaining) <= profile.arrivalRadius && Math.abs(nextVelocity) < 12;

  return {
    position: arrived ? target : nextPosition,
    velocity: arrived ? 0 : nextVelocity,
    arrived
  };
}

module.exports = {
  PET_PROFILES,
  ALLOWED_INTENTS,
  clamp,
  getPetProfile,
  normalizeEmotion,
  normalizeIntent,
  normalizePetAction,
  normalizePetSound,
  normalizePetType,
  stepMotion
};
