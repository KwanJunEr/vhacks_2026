// import React from 'react'

// const LogsIDScreen = () => {
//   return (
//     <div><Tabs
//         defaultValue="map"
//         className="flex-1 flex flex-col"
//         onValueChange={setActiveTab}
//       >
//         <TabsList className="bg-slate-100 border border-slate-200 p-1 self-start mb-6 shadow-sm overflow-x-auto max-w-full no-scrollbar">
//           <TabsTrigger
//             value="map"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <MapPin className="w-3.5 h-3.5" /> Live Map
//           </TabsTrigger>
//           <TabsTrigger
//             value="timeline"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <Terminal className="w-3.5 h-3.5" /> AI Timeline
//           </TabsTrigger>
//           <TabsTrigger
//             value="reasoning"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <BrainCircuit className="w-3.5 h-3.5" /> Reasoning
//           </TabsTrigger>
//           <TabsTrigger
//             value="heatmap"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <LayoutDashboard className="w-3.5 h-3.5" /> Heatmap
//           </TabsTrigger>
//           <TabsTrigger
//             value="graph"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <Network className="w-3.5 h-3.5" /> Agent Graph
//           </TabsTrigger>
//           <TabsTrigger
//             value="ops"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <Settings2 className="w-3.5 h-3.5" /> Drone Ops
//           </TabsTrigger>
//           <TabsTrigger
//             value="reports"
//             className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
//           >
//             <FileText className="w-3.5 h-3.5" /> Reports
//           </TabsTrigger>
//         </TabsList>

//         <div className="flex-1 relative glass-panel rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
//           <AnimatePresence>
//             {isLoading && <LoadingOverlay key="loading" />}
//           </AnimatePresence>

//           <TabsContent
//             value="map"
//             className="flex-1 m-0 focus-visible:outline-none h-full overflow-hidden"
//           >
//             <div className="flex flex-col md:flex-row h-full max-h-full items-stretch overflow-hidden">
//               <div className="flex-1 min-h-0 h-full">
//                 <DroneGridMap
//                   rows={ROWS}
//                   cols={COLS}
//                   drones={drones}
//                   scannedCells={scannedCells}
//                   hazardCells={hazardCells}
//                   survivorSector={survivorSector}
//                   survivorFound={survivorFound}
//                   isGenerating={isGenerating}
//                   missionComplete={missionComplete}
//                 />
//               </div>
//               <div className="w-full md:w-96 shrink-0 h-full border-l border-slate-200">
//                 <MissionControlPanel
//                   isDeployed={isDeployed}
//                   onDeploy={handleDeploy}
//                   logs={logs}
//                   onNavigate={handleNavigate}
//                 />
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent
//             value="timeline"
//             className="flex-1 m-0 focus-visible:outline-none"
//           >
//             <AITimeline />
//           </TabsContent>
//           <TabsContent
//             value="reasoning"
//             className="flex-1 m-0 focus-visible:outline-none"
//           >
//             <ReasoningPanel />
//           </TabsContent>
//           <TabsContent
//             value="heatmap"
//             className="flex-1 m-0 focus-visible:outline-none"
//           >
//             <ConfidenceHeatmap
//               scannedCells={scannedCells}
//               survivorSector={survivorSector}
//               survivorFound={survivorFound}
//             />
//           </TabsContent>
//           <TabsContent
//             value="graph"
//             className="flex-1 m-0 focus-visible:outline-none"
//           >
//             <AgentGraph />
//           </TabsContent>
//           <TabsContent
//             value="ops"
//             className="flex-1 m-0 focus-visible:outline-none"
//           >
//             <DroneOps drones={drones} />
//           </TabsContent>
//           <TabsContent
//             value="reports"
//             className="flex-1 m-0 focus-visible:outline-none overflow-y-auto"
//           >
//             <ReportsPanel />
//           </TabsContent>
//         </div>
//       </Tabs></div>
//   )
// }

// export default LogsIDScreen