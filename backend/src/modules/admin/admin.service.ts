import Prisma from "../../config/prisma.js";
import type { UpdateLeadInput } from "./admin.validation.js";
import type { AdminLeadsQuery } from "./admin.validation.js";

export async function adminTest() {
  return {
    message: "Welcome Admin",
  };
}

export async function getAdminUsers() {
  return Prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      profileCompleted: true,
      createdAt: true,
    },
  });
}

export async function getAdminLeads(query: AdminLeadsQuery) {
    const {
        page,
        limit,
        search,
        status,
        source,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
        ...(status
            ? {
                status,
            }
            : {}),

        ...(source
            ? {
                source,
            }
            : {}),

        ...(search
            ? {
                user: {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            profile: {
                                OR: [
                                    {
                                        name: {
                                            contains: search,
                                            mode: "insensitive" as const,
                                        },
                                    },
                                    {
                                        stageName: {
                                            contains: search,
                                            mode: "insensitive" as const,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            }
            : {}),
    };

    const [leads, total] = await Promise.all([
        Prisma.lead.findMany({
            where,

            skip,
            take: limit,

            orderBy: {
                createdAt: "desc",
            },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        verified: true,

                        profile: {
                            select: {
                                id: true,
                                name: true,
                                stageName: true,
                                language: true,
                                genre: true,
                                phone: true,

                                socials: {
                                    select: {
                                        platform: true,
                                        url: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }),

        Prisma.lead.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        leads,

        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
}


export async function getAdminLeadById(leadId: number) {
    return Prisma.lead.findUnique({
        where: {
            id: leadId,
        },

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    verified: true,
                    profileCompleted: true,
                    createdAt: true,

                    profile: {
                        select: {
                            id: true,
                            name: true,
                            stageName: true,
                            language: true,
                            genre: true,
                            phone: true,

                            socials: {
                                select: {
                                    platform: true,
                                    url: true,
                                },
                            },
                        },
                    },

                    subscriptions: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        include: {
                            plan: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    currency: true,
                                    duration: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}

export async function updateAdminLead(
    leadId: number,
    data: UpdateLeadInput
) {
    const existingLead = await Prisma.lead.findUnique({
        where: {
            id: leadId,
        },
    });

    if (!existingLead) {
        throw new Error("Lead not found");
    }

    const updateData: Record<string, unknown> = {};

    if (data.status !== undefined) {
        updateData.status = data.status;
    }

    if (data.notes !== undefined) {
        updateData.notes = data.notes;
    }

    if (data.lastContactedAt !== undefined) {
        updateData.lastContactedAt = data.lastContactedAt
            ? new Date(data.lastContactedAt)
            : null;
    }

    if (data.nextFollowUpAt !== undefined) {
        updateData.nextFollowUpAt = data.nextFollowUpAt
            ? new Date(data.nextFollowUpAt)
            : null;
    }

    if (data.convertedAt !== undefined) {
        updateData.convertedAt = data.convertedAt
            ? new Date(data.convertedAt)
            : null;
    }

    if (
        data.status === "CONVERTED" &&
        data.convertedAt === undefined
    ) {
        updateData.convertedAt = new Date();
    }

    return Prisma.lead.update({
        where: {
            id: leadId,
        },
        data: updateData,
    });
}


export async function getAdminLeadStats() {
    const [
        total,
        newLeads,
        contacted,
        interested,
        followUp,
        converted,
        notInterested,
        lost,
    ] = await Promise.all([
        Prisma.lead.count(),

        Prisma.lead.count({
            where: {
                status: "NEW",
            },
        }),

        Prisma.lead.count({
            where: {
                status: "CONTACTED",
            },
        }),

        Prisma.lead.count({
            where: {
                status: "INTERESTED",
            },
        }),

        Prisma.lead.count({
            where: {
                status: "FOLLOW_UP",
            },
        }),

        Prisma.lead.count({
            where: {
                status: "CONVERTED",
            },
        }),

        Prisma.lead.count({
            where: {
                status: "NOT_INTERESTED",
            },
        }),

        Prisma.lead.count({
            where: {
                status: "LOST",
            },
        }),
    ]);

    return {
        total,
        new: newLeads,
        contacted,
        interested,
        followUp,
        converted,
        notInterested,
        lost,
    };
}