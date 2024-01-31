import { Attribute, AttributeType, PrismaClient } from "@prisma/client";
import { AttributeValueInput } from "../types";
import { randomUUID } from "crypto";

export class AttributeHandler {
    private prisma : PrismaClient;

    constructor(prisma : PrismaClient) {
        this.prisma = prisma;
    }

    public async addAttribute(input : AttributeValueInput) : Promise<Attribute> {
        return await this.prisma.attribute.create({
            data: {
                ...input,
                id: randomUUID()
            }
        })
    }

    public async getAttributes() {
        const attributes = await this.prisma.attribute.findMany({
            orderBy: {
                value: "asc"
            }
        });
        const result = new Map<AttributeType,{id: string, value: string}[]>();

        for (const attribute of attributes) {
            const entry = {
                id: attribute.id,
                value: attribute.value
            }

            if (result.has(attribute.type)) {
                const newList = result.get(attribute.type)!;
                newList.push(entry);
                result.set(attribute.type, newList)
            } else {
                result.set(attribute.type, [entry])
            }
        }

        return result;
    }

    public async deleteAllAttributes() : Promise<number> {
        const deleted = await this.prisma.attribute.deleteMany();
        return deleted.count;
    }

    public async deleteAttribute(id : string) : Promise<Attribute|null> {
        return await this.getAttributeByID(id) ?
            await this.prisma.attribute.delete({
                where: {
                    id: id
                }
            }) :
            null;
    }

    public async getAttributeByID(id : string) : Promise<Attribute|null> {
        return await this.prisma.attribute.findUnique({
            where: {
                id: id
            }
        })
    }
}