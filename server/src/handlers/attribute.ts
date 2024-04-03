import { Attribute, AttributeType, PrismaClient } from "@prisma/client";
import { AttributeValueInput } from "../interfaces";
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

    public async getAttributes() : Promise<{[type: string] : string[]}>{
        const attributes = await this.prisma.attribute.findMany({
            orderBy: {
                value: "asc"
            }
        });
        const map = new Map<AttributeType,{id: string, value: string}[]>();

        for (const attribute of attributes) {
            const entry = {
                id: attribute.id,
                value: attribute.value
            }

            if (map.has(attribute.type)) {
                const newList = map.get(attribute.type)!;
                newList.push(entry);
                map.set(attribute.type, newList)
            } else {
                map.set(attribute.type, [entry])
            }
        }

        const result : {[type: string] : string[]}= {};
        for (const [key, value] of map.entries()) {
            result[key] = value.map(val => val.value)
        }

        return result;
    }

    public async deleteAllAttributes() : Promise<number> {
        const deleted = await this.prisma.attribute.deleteMany();
        return deleted.count;
    }

    public async deleteAttribute(value : string) : Promise<number> {
        const deleted = await this.prisma.attribute.deleteMany({
            where: {
                value: value
            }
        });
        return deleted.count;
    }

    public async getAttributeByID(id : string) : Promise<Attribute|null> {
        return await this.prisma.attribute.findUnique({
            where: {
                id: id
            }
        })
    }
}