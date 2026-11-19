import { testEnvironment } from '../scripts/test-environment.mjs'
import { dayMs, dubaiDay } from '../src/lib/follow-up'
import { prisma } from '../src/lib/db'
import type {LeadStatus,UnitType} from '../src/generated/prisma/enums'

// The local test account has privileges only on its own schema.
Object.assign(process.env,testEnvironment())
const people: [string,string|null,UnitType,LeadStatus,number|null,boolean][] = [
  ['Lina West','instagram','TWO_BED','CONTACTED',-1,false],
  ['Noor Lane','google','THREE_BED','QUALIFIED',0,false],
  ['Leo Park','broker','FOUR_BED','CONTACTED',2,false],
  ['Maya North','google','ONE_BED','CLOSED',-3,true],
  ['Eli Dale',null,'UNDECIDED','NEW',null,false],
]
try {
  const admin=await prisma.adminUser.findUniqueOrThrow({where:{email:process.env.ADMIN_EMAIL!}})
  const project=await prisma.project.findUniqueOrThrow({where:{slug:'liora'}})
  for(const [index,[fullName,utmSource,interestedUnitType,status,offset,completed]] of people.entries()){
    const key='a7121040-0000-4000-8000-00000000000'+index
    const createdAt=new Date(Date.now()-5*dayMs)
    const at=new Date(dubaiDay(new Date(Date.now()+(offset??0)*dayMs))+'T10:00:00+04:00')
    await prisma.lead.upsert({where:{idempotencyKey:key},update:{},create:{
      projectId:project.id,fullName,email:'demo.'+index+'@example.test',phone:'+1202555010'+index,
      status,interestedUnitType,leadSource:'Fictional demonstration',utmSource,utmCampaign:'Liora walkthrough',
      idempotencyKey:key,requestDigest:'0'.repeat(64),contactConsentAt:createdAt,createdAt,
      ...(offset===null?{}:{followUp:{create:{scheduledAt:at,hasTime:true,notes:'Review requested plans.',completedAt:completed?at:null}},
        activities:{create:[{actorId:admin.id,action:'SCHEDULE' as const,details:dubaiDay(at)+' · 10:00 Dubai · Review plans',createdAt},...(completed?[{actorId:admin.id,action:'COMPLETE' as const,details:'Buyer reviewed the plans.',createdAt:at}]:[])]}}),
    }})
  }
  console.info('Five fictional examples provisioned in the local test database.')
} finally {await prisma.$disconnect()}
