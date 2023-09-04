import { SHA256 } from "crypto-js";
import { createContext } from "react";
import { encrypt } from "utils/hash";

export type Day = BellTime[];
export type BellTime = {
  id: string,
  name: string,
  hour: number,
  minute: number,
  location?: string,
}
export type School = {
  name: string,
  bell_times: Day[],
}

export type Agent = {
  getSchool: () => Promise<School>,
  putSchool: (school: School, password: string | null) => Promise<void>,
  getPassword: () => Promise<boolean>,
  putPassword: (previous: string, next: string | null) => Promise<void>,
}

export const Agent = function (this: Agent, url: string) {
  this.getSchool = async () => {
    const response = await fetch(`${url}/school`)
    if (!response.ok)
      throw new Error()
    const school = await response.json()
    return school as School
  }
  this.putSchool = async (school, password: string | null) => {
    if (!password) return
    if (!(await fetch(`${url}/school`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Assembly-Password': SHA256(password).toString(),
      },
      body: JSON.stringify(school),
    })).ok)
      throw new Error()
  }
  this.getPassword = async () => {
    const response = await fetch(`${url}/password`)
    if (!response.ok)
      throw new Error()
    const password = await response.text()
    return !!password
  }
  this.putPassword = async (previous, next: string | null) => {
    if (!(next && previous)) throw new Error()
    if (!(await fetch(`${url}/password`, {
      method: 'PUT',
      headers: {
        'X-Assembly-Password': SHA256(previous).toString(),
      },
      body: (await encrypt(next))
    })).ok)
      throw new Error()
  }
} as unknown as { new(url: string): Agent }

export const AgentContext = createContext<Agent>({} as Agent)
