const validateBody=(payload, requiredItems )=>{
  if(!payload){
    return requiredItems
  }
  const missingFields= requiredItems.filter((field)=>{
    return payload[field]===undefined || payload[field]==='' || payload[field]===null
  })
  return missingFields
}


export {validateBody}