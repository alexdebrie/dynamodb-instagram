import { DynamoDB } from "aws-sdk"
import { Item } from "./base"
import { getClient } from "./client"

export class User extends Item {
    username: string
    name: string
    followerCount: number
    followingCount: number

    constructor(username: string, name?: string, followerCount?: number, followingCount?: number) {
        super()
        this.username = username
        this.name = name || ""
        this.followerCount = followerCount || 0
        this.followingCount = followingCount || 0
    }

    static fromItem(item?: DynamoDB.AttributeMap): User {
        if (!item) throw new Error("No item!")
        return new User(item.username.S, item.name.S, Number(item.followerCount.N), Number(item.followingCount.N))
    }

    get pk(): string {
        return `USER#${this.username}`
    }

    get sk(): string {
        return `USER#${this.username}`
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            username: { S: this.username },
            name: { S: this.name },
            followerCount: { N: this.followerCount.toString() },
            followingCount: { N: this.followingCount.toString() }
        }
    }
}

export const createUser = async (user: User): Promise<User> => {
    const client = getClient()

    try {
        await client
            .putItem({
                TableName: process.env.TABLE_NAME,
                Item: user.toItem(),
                ConditionExpression: "attribute_not_exists(PK)"
            })
            .promise()
        return user
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getUser = async (username: string): Promise<User> => {
    const client = getClient()
    const user = new User(username, "")

    try {
        const resp = await client
            .getItem({
                TableName: process.env.TABLE_NAME,
                Key: user.keys()
            })
            .promise()
        return User.fromItem(resp.Item)
    } catch (error) {
        console.log(error)
        throw error
    }
}
