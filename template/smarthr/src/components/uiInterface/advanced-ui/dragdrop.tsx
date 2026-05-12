"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import ImageWithBasePath from "@/core/common/imageWithBasePath";
import CommonFooter from "@/core/common/commonFooter/footer";
import { all_routes } from "@/routes/all_routes";
import Link from "next/link";


interface Item {
  id: string;
  content: string;
  color: string;
}



const DragAndDropComponent = () => {
  // Data for simple drag and drop
  const [simpleItems, setSimpleItems] = useState<Item[]>([
    { id: '1', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', color: 'bg-primary' },
    { id: '2', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', color: 'bg-secondary' },
    { id: '3', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', color: 'bg-success' },
    { id: '4', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', color: 'bg-info' },
    { id: '5', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', color: 'bg-warning' },
    { id: '6', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.', color: 'bg-danger' },
  ]);

  // Data for move between containers
  const [containers, setContainers] = useState({
    left: [
      { id: 'l1', name: 'Louis K. Bond', role: 'Founder & CEO', quote: 'Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven\'t heard of them tattooed master cleanse live-edge keffiyeh.', avatar: 'assets/img/profiles/avatar-01.jpg' },
      { id: 'l2', name: 'Dennis N. Cloutier', role: 'Software Engineer', quote: 'Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven\'t heard of them tattooed master cleanse live-edge keffiyeh.', avatar: 'assets/img/profiles/avatar-02.jpg' },
      { id: 'l3', name: 'Susan J. Sander', role: 'Web Designer', quote: 'Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven\'t heard of them tattooed master cleanse live-edge keffiyeh.', avatar: 'assets/img/profiles/avatar-03.jpg' },
    ],
    right: [
      { id: 'r1', name: 'James M. Short', role: 'Web Developer', quote: 'Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven\'t heard of them tattooed master cleanse live-edge keffiyeh', avatar: 'assets/img/profiles/avatar-04.jpg' },
      { id: 'r2', name: 'Gabriel J. Snyder', role: 'Business Analyst', quote: 'Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven\'t heard of them tattooed master cleanse live-edge keffiyeh', avatar: 'assets/img/profiles/avatar-05.jpg' },
      { id: 'r3', name: 'Louie C. Mason', role: 'Human Resources', quote: 'Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven\'t heard of them tattooed master cleanse live-edge keffiyeh', avatar: 'assets/img/profiles/avatar-06.jpg' },
    ],
  });

  // Data for handle drag and drop
  const [handleContainers, setHandleContainers] = useState({
    left: [
      { id: 'hl1', name: 'Louis K. Bond', role: 'Founder & CEO', avatar: 'assets/img/profiles/avatar-07.jpg' },
      { id: 'hl2', name: 'Dennis N. Cloutier', role: 'Software Engineer', avatar: 'assets/img/profiles/avatar-08.jpg' },
      { id: 'hl3', name: 'Susan J. Sander', role: 'Web Designer', avatar: 'assets/img/profiles/avatar-09.jpg' },
    ],
    right: [
      { id: 'hr1', name: 'James M. Short', role: 'Web Developer', avatar: 'assets/img/profiles/avatar-10.jpg' },
      { id: 'hr2', name: 'Gabriel J. Snyder', role: 'Business Analyst', avatar: 'assets/img/profiles/avatar-05.jpg' },
      { id: 'hr3', name: 'Louie C. Mason', role: 'Human Resources', avatar: 'assets/img/profiles/avatar-03.jpg' },
    ],
  });

  const onDragEndSimple = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(simpleItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSimpleItems(items);
  };

  const onDragEndContainers = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId as keyof typeof containers;
    const destId = destination.droppableId as keyof typeof containers;

    if (sourceId === destId) {
      // Reorder within the same list
      const items = Array.from(containers[sourceId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setContainers({ ...containers, [sourceId]: items });
    } else {
      // Move between lists
      const sourceItems = Array.from(containers[sourceId]);
      const destItems = Array.from(containers[destId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);
      setContainers({ ...containers, [sourceId]: sourceItems, [destId]: destItems });
    }
  };

  const onDragEndHandle = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId as keyof typeof handleContainers;
    const destId = destination.droppableId as keyof typeof handleContainers;

    if (sourceId === destId) {
      const items = Array.from(handleContainers[sourceId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setHandleContainers({ ...handleContainers, [sourceId]: items });
    } else {
      const sourceItems = Array.from(handleContainers[sourceId]);
      const destItems = Array.from(handleContainers[destId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);
      setHandleContainers({ ...handleContainers, [sourceId]: sourceItems, [destId]: destItems });
    }
  };
  return (
 <div className="page-wrapper cardhead">
  <div className="content">
    {/* Page Header */}
    <div className="page-header">
      <div className="row">
        <div className="col-sm-12">
          <h3 className="page-title">Drag &amp; Drop</h3>
          <ul className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href={all_routes.adminDashboard}>Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Drag &amp; Drop</li>
          </ul>
        </div>
      </div>
    </div>
    {/* /Page Header */}
    {/* start row */}
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header border-bottom d-flex align-items-center">
            <h4 className="header-title">Simple Drag and Drop Example</h4>
          </div>
          <div className="card-body">
            <p className="text-muted mb-0">
              Just specify the data attribute <code>data-plugin='dragula'</code>{" "}
              to have drag and drop support in your container.
            </p>
            {/* start row */}
            <DragDropContext onDragEnd={onDragEndSimple}>
              <Droppable droppableId="simple-dragula" direction="horizontal">
                {(provided) => (
                  <div
                    className="row"
                    id="simple-dragula"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {simpleItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            className="col-md-4"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className={`card mb-0 mt-4 text-white ${item.color}`}>
                              <div className="card-body">
                                <blockquote className="card-bodyquote mb-0">
                                  <p>{item.content}</p>
                                  <footer>
                                    Someone famous in{" "}
                                    <cite title="Source Title">Source Title</cite>
                                  </footer>
                                </blockquote>
                              </div>{" "}
                              {/* end card body */}
                            </div>{" "}
                            {/* end card */}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {/* end row */}
          </div>{" "}
          {/* end card body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
    {/* start row */}
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header border-bottom d-flex align-items-center">
            <h4 className="header-title">Move stuff between containers</h4>
          </div>
          <div className="card-body">
            <p className="text-muted">
              Just specify the data attribute <code>data-plugin='dragula'</code>{" "}
              and{" "}
              <code>
                data-containers='["first-container-id", "second-container-id"]'
              </code>
              .
            </p>
            {/* start row */}
            <DragDropContext onDragEnd={onDragEndContainers}>
              <div className="row">
                <div className="col-md-6">
                  <div className="bg-light bg-opacity-50 p-2 p-lg-4">
                    <h5 className="mt-0 mb-0">Part 1</h5>
                    <Droppable droppableId="left">
                      {(provided) => (
                        <div
                          id="company-list-left"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {containers.left.map((person, index) => (
                            <Draggable key={person.id} draggableId={person.id} index={index}>
                              {(provided) => (
                                <div
                                  className="card mb-0 mt-4"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="card-body">
                                    <div className="d-flex align-items-start">
                                      <ImageWithBasePath
                                        src={person.avatar}
                                        alt="image"
                                        className="me-3 d-none d-sm-block avatar avatar-md rounded-circle"
                                      />
                                      <div className="w-100 overflow-hidden">
                                        <h5 className="mb-1 mt-0">{person.name}</h5>
                                        <p>{person.role}</p>
                                        <p className="mb-0 text-muted">
                                          <span className="fst-italic">
                                            <b>"</b>{person.quote}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>{" "}
                                  {/* end card-body */}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>{" "}
                  {/* end div.bg-light */}
                </div>{" "}
                {/* end col */}
                <div className="col-md-6">
                  <div className="bg-light bg-opacity-50 p-2 p-lg-4">
                    <h5 className="mt-0 mb-0">Part 2</h5>
                    <Droppable droppableId="right">
                      {(provided) => (
                        <div
                          id="company-list-right"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {containers.right.map((person, index) => (
                            <Draggable key={person.id} draggableId={person.id} index={index}>
                              {(provided) => (
                                <div
                                  className="card mb-0 mt-4"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex align-items-start">
                                      <ImageWithBasePath
                                        src={person.avatar}
                                        alt="image"
                                        className="me-3 d-none d-sm-block avatar avatar-md rounded-circle"
                                      />
                                      <div className="w-100 overflow-hidden">
                                        <h5 className="mb-1 mt-0">{person.name}</h5>
                                        <p>{person.role}</p>
                                        <p className="mb-0 text-muted">
                                          <span className="fst-italic">
                                            <b>"</b>{person.quote}{" "}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>{" "}
                                  {/* end card-body */}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>{" "}
                  {/* end div.bg-light */}
                </div>{" "}
                {/* end col */}
              </div>{" "}
            </DragDropContext>
            {/* end row */}
          </div>{" "}
          {/* end card-body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
    {/* start row */}
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header border-bottom d-flex align-items-center">
            <h4 className="header-title">
              Move stuff between containers using handle
            </h4>
          </div>
          <div className="card-body">
            <p className="text-muted">
              Just specify the data attribute <code>data-plugin='dragula'</code>
              ,{" "}
              <code>
                data-containers='["first-container-id", "second-container-id"]'
              </code>{" "}
              and <code>data-handle-class='dragula-handle'</code>.
            </p>
            {/* start row */}
            <DragDropContext onDragEnd={onDragEndHandle}>
              <div className="row">
                <div className="col-md-6">
                  <div className="bg-light bg-opacity-50 p-2 p-lg-4">
                    <h5 className="mt-0">Part 1</h5>
                    <Droppable droppableId="handle-left">
                      {(provided) => (
                        <div
                          id="handle-dragula-left"
                          className="pt-2"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {handleContainers.left.map((person, index) => (
                            <Draggable key={person.id} draggableId={person.id} index={index}>
                              {(provided) => (
                                <div
                                  className="card mb-0 mt-4"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <div className="card-body">
                                    <div className="d-flex align-items-center">
                                      <ImageWithBasePath
                                        src={person.avatar}
                                        alt="image"
                                        className="me-3 d-none d-sm-block avatar avatar-md rounded-circle"
                                      />
                                      <div className="w-100 overflow-hidden">
                                        <h5 className="mb-1">{person.name}</h5>
                                        <p className="mb-0">{person.role}</p>
                                      </div>
                                      <span
                                        className="dragula-handle"
                                        {...provided.dragHandleProps}
                                      />
                                    </div>
                                  </div>{" "}
                                  {/* end card-body */}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>{" "}
                  {/* end div */}
                </div>{" "}
                {/* end col */}
                <div className="col-md-6">
                  <div className="bg-light bg-opacity-50 p-2 p-lg-4">
                    <h5 className="mt-0">Part 2</h5>
                    <Droppable droppableId="handle-right">
                      {(provided) => (
                        <div
                          id="handle-dragula-right"
                          className="pt-2"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {handleContainers.right.map((person, index) => (
                            <Draggable key={person.id} draggableId={person.id} index={index}>
                              {(provided) => (
                                <div
                                  className="card mb-0 mt-4"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                >
                                  <div className="card-body p-3">
                                    <div className="d-flex align-items-center">
                                      <ImageWithBasePath
                                        src={person.avatar}
                                        alt="image"
                                        className="me-3 d-none d-sm-block avatar avatar-md rounded-circle"
                                      />
                                      <div className="w-100 overflow-hidden">
                                        <h5 className="mb-1">{person.name}</h5>
                                        <p className="mb-0">{person.role}</p>
                                      </div>
                                      <span
                                        className="dragula-handle"
                                        {...provided.dragHandleProps}
                                      />
                                    </div>
                                  </div>{" "}
                                  {/* end card-body */}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>{" "}
                  {/* end div */}
                </div>{" "}
                {/* end col */}
              </div>
            </DragDropContext>
            {/* end row */}
          </div>{" "}
          {/* end card-body */}
        </div>{" "}
        {/* end card */}
      </div>{" "}
      {/* end col */}
    </div>
    {/* end row */}
  </div>
 <CommonFooter/>
</div>

  );
};

export default DragAndDropComponent;