import { DynamoDB } from "aws-sdk"

import { Item } from "./base"
import { getClient } from "./client"
import { User } from "./user"
import { executeTransactWrite } from "./utils"

export class Follow extends Item {
    followedUsername: string
    followingUsername: string

    constructor(followedUsername: string, followingUsername: string) {
        super()
        this.followedUsername = followedUsername
        this.followingUsername = followingUsername
    }

    static fromItem(item?: DynamoDB.AttributeMap): Follow {
        if (!item) throw new Error("No item!")
        return new Follow(item.followedUsername.S, item.followingUsername.S)
    }

    get pk(): string {
        return `FOLLOW#${this.followedUsername}`
    }

    get sk(): string {
        return `FOLLOW#${this.followingUsername}`
    }

    get gsi1pk(): string {
        return this.sk
    }

    get gsi1sk(): string {
        return this.pk
    }

    toItem(): Record<string, unknown> {
        return {
            ...this.keys(),
            GSI1PK: { S: this.gsi1pk },
            GSI1SK: { S: this.gsi1sk },
            followedUsername: { S: this.followedUsername},
            followingUsername: { S: this.followingUsername},
        }
    }
}

export const followUser = async (followedUsername: string, followingUsername: string) => {
    const client = getClient()
    const followedUser = new User(followedUsername);
    const followingUser = new User(followingUsername);
    const follow = new Follow(followedUsername, followingUsername)

    try {
        await executeTransactWrite({
            client,
            params: {
                TransactItems: [
                    {
                        Put: {
                            TableName: process.env.TABLE_NAME,
                            Item: follow.toItem(),
                            ConditionExpression: "attribute_not_exists(PK)"
                        }
                    },
                    {
                        Update: {
                            TableName: process.env.TABLE_NAME,
                            Key: followedUser.keys(),
                            ConditionExpression: "attribute_exists(PK)",
                            UpdateExpression: "SET #followerCount = #followerCount+ :inc",
                            ExpressionAttributeNames: {
                                "#followerCount": "followerCount"
                            },
                            ExpressionAttributeValues: {
                                ":inc": { N: "1" }
                            }
                        }
                    },
                    {
                        Update: {
                            TableName: process.env.TABLE_NAME,
                            Key: followingUser.keys(),
                            ConditionExpression: "attribute_exists(PK)",
                            UpdateExpression: "SET #followingCount = #followingCount+ :inc",
                            ExpressionAttributeNames: {
                                "#followingCount": "followingCount"
                            },
                            ExpressionAttributeValues: {
                                ":inc": { N: "1" }
                            }
                        }
                    }
                ]
            }
        })
        return follow
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const listFollowersOfUser = async (username: string): Promise<User[]> => {
    const client = getClient()
    const follow = new Follow(username, "")

    let follows: Follow[];

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": { S: follow.pk }
                }
            })
            .promise()
        follows = resp.Items.map((item) => Follow.fromItem(item))
    } catch (error) {
        console.log(error)
        throw error
    }

    const keys = follows.map((follow) => {
        const user = new User(follow.followingUsername)
        return user.keys()
    })

    try {
        const resp = await client.batchGetItem({
            RequestItems: {
                [process.env.TABLE_NAME]: {
                    Keys: keys
                }
            }
        }).promise()
        return resp.Responses[process.env.TABLE_NAME].map((item) => User.fromItem(item))
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const listFollowedByUser = async (username: string): Promise<User[]> => {
    const client = getClient()
    const follow = new Follow("", username)

    let follows: Follow[];
    console.log(follow)
    console.log(follow.gsi1pk)

    try {
        const resp = await client
            .query({
                TableName: process.env.TABLE_NAME,
                IndexName: "GSI1",
                KeyConditionExpression: "GSI1PK = :gsi1pk",
                ExpressionAttributeValues: {
                    ":gsi1pk": { S: follow.gsi1pk }
                }
            })
            .promise()
        follows = resp.Items.map((item) => Follow.fromItem(item))
    } catch (error) {
        console.log(error)
        throw error
    }

    const keys = follows.map((follow) => {
        const user = new User(follow.followedUsername)
        return user.keys()
    })

    try {
        const resp = await client.batchGetItem({
            RequestItems: {
                [process.env.TABLE_NAME]: {
                    Keys: keys
                }
            }
        }).promise()
        return resp.Responses[process.env.TABLE_NAME].map((item) => User.fromItem(item))
    } catch (error) {
        console.log(error)
        throw error
    }
}
