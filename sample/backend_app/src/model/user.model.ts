import { BaseModel } from 'cirri/lib'
import { Column, Entity } from 'typeorm'

@Entity('users')
export default class UserModel extends BaseModel {
    @Column()
    name: string

    @Column()
    password: string
}
