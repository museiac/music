import Prisma from "../../config/prisma.js";
import type { CreatePlanInput, UpdatePlanInput } from "./plan.validate.js";

// Create Plan

export async function createPlan(data: CreatePlanInput){
    const plan = await Prisma.plan.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      currency: data.currency,
      duration: data.duration,
      features: data.features,
    },
  });

  return plan;
}


//Get All Plans

export async function getAllPlans(){
    const plans = await Prisma.plan.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return plans;
}

//Get active Plans

export async function getActivePlans() {
  const plans = await Prisma.plan.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      price: "asc",
    },
  });

  return plans;
}

// Get single Plan

export async function getPlanById(id: number) {
  const plan = await Prisma.plan.findUnique({
    where: {
      id,
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
}


// Update Plan

export async function updatePlan(
  id: number,
  data: UpdatePlanInput
) {
  const existingPlan = await Prisma.plan.findUnique({
    where: { id },
  });

  if (!existingPlan) {
    throw new Error("Plan not found");
  }

  const plan = await Prisma.plan.update({
    where: { id },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.price !== undefined && {
        price: data.price,
      }),

      ...(data.currency !== undefined && {
        currency: data.currency,
      }),

      ...(data.duration !== undefined && {
        duration: data.duration,
      }),

      ...(data.features !== undefined && {
        features: data.features,
      }),
    },
  });

  return plan;
}


// change plan status

export async function updatePlanStatus(
  id: number,
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED"
) {
  const existingPlan = await Prisma.plan.findUnique({
    where: {
      id,
    },
  });

  if (!existingPlan) {
    throw new Error("Plan not found");
  }

  const plan = await Prisma.plan.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return plan;
}