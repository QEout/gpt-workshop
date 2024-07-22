// 'use client';
import { Suspense } from "react";
import { workshopService } from "../services/workshop";
import { useRequest } from "ahooks";

//workshop server component
async function WorkshopList({page}:{page:number}) {
  const workshops = await workshopService.getWorkshopList({
    page,
    limit: 10
  });
  console.log(workshops)
  return (
    <div>
      {workshops?.map((workshop) => (
        <div key={workshop.id}>
          <h2>{workshop.name}</h2>
          <p>{workshop.description}</p>
        </div>
      ))}
      
    </div>
  );
}

export default async function WorkshopPage({
  searchParams
}:{
  searchParams?:{
    page?:number,
  }
}) {
  // const {data}=useRequest(()=>workshopService.getWorkshopList({
  //   page: 1,
  //   limit: 10
  // }));
  // console.log(data)

    return (
      <div>
        <h1>Workshop</h1>
        <p>
          This is a workshop page. It is a server component because it is in the
          <code>app/workshop</code> directory.
        </p>
        <section>
          <Suspense fallback={<div>Loading...</div>}>
            <WorkshopList page={
              searchParams?.page || 1
            } />
          </Suspense>
        </section>
      </div>
    );
}
