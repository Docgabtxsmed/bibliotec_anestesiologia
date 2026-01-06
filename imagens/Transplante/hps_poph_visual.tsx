import React, { useState } from 'react';
import { AlertCircle, Heart, Activity } from 'lucide-react';

const HPSPOPHDiagnostics = () => {
  const [activeTab, setActiveTab] = useState('HPS');

  const hpsData = {
    title: "Síndrome Hepatopulmonar",
    icon: <Activity className="w-8 h-8" />,
    color: "blue",
    criteria: [
      "Presença de doença hepática",
      "Evidência de dilatações vasculares intrapulmonares e/ou shunting",
      "P(A-a) O₂ gradiente ≥15 mm Hg (ou >20 mm Hg se idade ≥65)"
    ],
    stages: [
      { name: "Leve", value: "≥80 mm Hg", color: "bg-green-100 border-green-400", textColor: "text-green-800" },
      { name: "Moderada", value: "60-79 mm Hg", color: "bg-yellow-100 border-yellow-400", textColor: "text-yellow-800" },
      { name: "Grave", value: "50-59 mm Hg", color: "bg-red-100 border-red-400", textColor: "text-red-800" }
    ],
    parameter: "PaO₂"
  };

  const pophData = {
    title: "Hipertensão Portopulmonar",
    icon: <Heart className="w-8 h-8" />,
    color: "purple",
    criteria: [
      "Presença de hipertensão portal",
      "mPAP >25 mm Hg",
      "PCWP <15 mm Hg",
      "RVP >240 dynes/cm⁵"
    ],
    stages: [
      { name: "Leve", value: ">25-<35 mm Hg", color: "bg-green-100 border-green-400", textColor: "text-green-800" },
      { name: "Moderada", value: "≥35-<45 mm Hg", color: "bg-yellow-100 border-yellow-400", textColor: "text-yellow-800" },
      { name: "Grave", value: "≥45 mm Hg", color: "bg-red-100 border-red-400", textColor: "text-red-800" }
    ],
    parameter: "mPAP"
  };

  const currentData = activeTab === 'HPS' ? hpsData : pophData;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Critérios Diagnósticos e Estadiamento
          </h1>
          <p className="text-slate-600 text-lg">HPS e Hipertensão Portopulmonar</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('HPS')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === 'HPS'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-6 h-6" />
            <span>Síndrome Hepatopulmonar</span>
          </button>
          <button
            onClick={() => setActiveTab('POPH')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              activeTab === 'POPH'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className="w-6 h-6" />
            <span>Hipertensão Portopulmonar</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Diagnostic Criteria */}
          <div className="mb-10">
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b-2 ${
              activeTab === 'HPS' ? 'border-blue-600' : 'border-purple-600'
            }`}>
              <AlertCircle className={`w-7 h-7 ${
                activeTab === 'HPS' ? 'text-blue-600' : 'text-purple-600'
              }`} />
              <h2 className="text-2xl font-bold text-slate-800">Critérios Diagnósticos</h2>
            </div>
            <div className="grid gap-4">
              {currentData.criteria.map((criterion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    activeTab === 'HPS'
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-purple-50 border-purple-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-bold text-lg ${
                      activeTab === 'HPS' ? 'text-blue-700' : 'text-purple-700'
                    }`}>
                      {index + 1}.
                    </span>
                    <span className="text-slate-700 text-lg">{criterion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staging */}
          <div>
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b-2 ${
              activeTab === 'HPS' ? 'border-blue-600' : 'border-purple-600'
            }`}>
              <div className={activeTab === 'HPS' ? 'text-blue-600' : 'text-purple-600'}>
                {currentData.icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-800">
                Estadiamento por {currentData.parameter}
              </h2>
            </div>
            
            <div className="space-y-4">
              {currentData.stages.map((stage, index) => (
                <div
                  key={index}
                  className={`${stage.color} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-102`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${stage.color} border-2 flex items-center justify-center font-bold text-xl ${stage.textColor}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${stage.textColor}`}>
                          {stage.name}
                        </div>
                        <div className="text-slate-600 text-sm mt-1">
                          {currentData.parameter}
                        </div>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${stage.textColor}`}>
                      {stage.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Modificado de Raevens S. Recent advances in the management of hepatopulmonary syndrome and portopulmonary hypertension.</p>
          <p className="italic">Acta Gastroenterol Belg. 2021;84(1):95–99.</p>
        </div>
      </div>
    </div>
  );
};

export default HPSPOPHDiagnostics;