import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, category = 'panjabi' }) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'panjabi' | 'shirt' | 'women' | 'pant'>('panjabi');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold tracking-wide">
              {language === 'bn' ? 'সাইজ চার্ট ও পরিমাপ নির্দেশিকা' : 'SK Shop Size & Fit Guide'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-3 overflow-x-auto space-x-2">
          {[
            { id: 'panjabi', labelEn: 'Panjabi (Ethnic)', labelBn: 'পাঞ্জাবি' },
            { id: 'shirt', labelEn: "Men's Shirts & Polos", labelBn: 'শার্ট ও পোলো' },
            { id: 'women', labelEn: "Women's Kameez / Kurti", labelBn: 'কুর্তি ও কামিজ' },
            { id: 'pant', labelEn: "Denim & Trousers", labelBn: 'প্যান্ট ও জিন্স' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-stone-900 border-t-2 border-amber-600 shadow-sm font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="p-6 overflow-x-auto max-h-[70vh]">
          {activeTab === 'panjabi' && (
            <div>
              <p className="text-xs text-stone-500 mb-3 italic">
                {language === 'bn' 
                  ? '* সব পরিমাপ ইঞ্চিতে দেওয়া হলো। সেমি-ফিট কাটিং।'
                  : '* All measurements are given in inches. Regular to Semi-fit silhouette.'}
              </p>
              <table className="w-full text-sm text-left border-collapse border border-stone-200">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-semibold">
                    <th className="p-3 border border-stone-200">Size</th>
                    <th className="p-3 border border-stone-200">Chest (বুকে)</th>
                    <th className="p-3 border border-stone-200">Length (দৈর্ঘ্য)</th>
                    <th className="p-3 border border-stone-200">Shoulder (কাঁধ)</th>
                    <th className="p-3 border border-stone-200">Sleeve (হাতা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">S (38)</td>
                    <td className="p-3 border border-stone-200">38"-39"</td>
                    <td className="p-3 border border-stone-200">40"</td>
                    <td className="p-3 border border-stone-200">17.5"</td>
                    <td className="p-3 border border-stone-200">24.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">M (40)</td>
                    <td className="p-3 border border-stone-200">40"-41"</td>
                    <td className="p-3 border border-stone-200">42"</td>
                    <td className="p-3 border border-stone-200">18"</td>
                    <td className="p-3 border border-stone-200">25"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">L (42)</td>
                    <td className="p-3 border border-stone-200">42"-43"</td>
                    <td className="p-3 border border-stone-200">44"</td>
                    <td className="p-3 border border-stone-200">18.5"</td>
                    <td className="p-3 border border-stone-200">25.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">XL (44)</td>
                    <td className="p-3 border border-stone-200">44"-45"</td>
                    <td className="p-3 border border-stone-200">45"</td>
                    <td className="p-3 border border-stone-200">19"</td>
                    <td className="p-3 border border-stone-200">26"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">XXL (46)</td>
                    <td className="p-3 border border-stone-200">46"-48"</td>
                    <td className="p-3 border border-stone-200">46"</td>
                    <td className="p-3 border border-stone-200">20"</td>
                    <td className="p-3 border border-stone-200">26.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shirt' && (
            <div>
              <p className="text-xs text-stone-500 mb-3 italic">
                * Slim Fit Formal & Casual Cotton Shirts (Inches)
              </p>
              <table className="w-full text-sm text-left border-collapse border border-stone-200">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-semibold">
                    <th className="p-3 border border-stone-200">Collar Size</th>
                    <th className="p-3 border border-stone-200">Chest</th>
                    <th className="p-3 border border-stone-200">Length</th>
                    <th className="p-3 border border-stone-200">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">15 (M)</td>
                    <td className="p-3 border border-stone-200">40"</td>
                    <td className="p-3 border border-stone-200">29"</td>
                    <td className="p-3 border border-stone-200">17.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">15.5 (L)</td>
                    <td className="p-3 border border-stone-200">42"</td>
                    <td className="p-3 border border-stone-200">30"</td>
                    <td className="p-3 border border-stone-200">18.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">16 (XL)</td>
                    <td className="p-3 border border-stone-200">44"</td>
                    <td className="p-3 border border-stone-200">31"</td>
                    <td className="p-3 border border-stone-200">19"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">16.5 (XXL)</td>
                    <td className="p-3 border border-stone-200">46"</td>
                    <td className="p-3 border border-stone-200">31.5"</td>
                    <td className="p-3 border border-stone-200">19.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'women' && (
            <div>
              <p className="text-xs text-stone-500 mb-3 italic">
                * Stitched Kameez & Kurti Standard Sizing (Inches)
              </p>
              <table className="w-full text-sm text-left border-collapse border border-stone-200">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-semibold">
                    <th className="p-3 border border-stone-200">Size</th>
                    <th className="p-3 border border-stone-200">Bust (বক্ষ)</th>
                    <th className="p-3 border border-stone-200">Waist (কোমর)</th>
                    <th className="p-3 border border-stone-200">Hip (নিতম্ব)</th>
                    <th className="p-3 border border-stone-200">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">S (36)</td>
                    <td className="p-3 border border-stone-200">36"</td>
                    <td className="p-3 border border-stone-200">32"</td>
                    <td className="p-3 border border-stone-200">38"</td>
                    <td className="p-3 border border-stone-200">42"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">M (38)</td>
                    <td className="p-3 border border-stone-200">38"</td>
                    <td className="p-3 border border-stone-200">34"</td>
                    <td className="p-3 border border-stone-200">40"</td>
                    <td className="p-3 border border-stone-200">43"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">L (40)</td>
                    <td className="p-3 border border-stone-200">40"</td>
                    <td className="p-3 border border-stone-200">36"</td>
                    <td className="p-3 border border-stone-200">42"</td>
                    <td className="p-3 border border-stone-200">44"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">XL (42)</td>
                    <td className="p-3 border border-stone-200">42"</td>
                    <td className="p-3 border border-stone-200">38"</td>
                    <td className="p-3 border border-stone-200">44"</td>
                    <td className="p-3 border border-stone-200">44"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">XXL (44)</td>
                    <td className="p-3 border border-stone-200">44"</td>
                    <td className="p-3 border border-stone-200">40"</td>
                    <td className="p-3 border border-stone-200">46"</td>
                    <td className="p-3 border border-stone-200">45"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pant' && (
            <div>
              <p className="text-xs text-stone-500 mb-3 italic">
                * Jeans & Chino Trousers Sizing (Inches)
              </p>
              <table className="w-full text-sm text-left border-collapse border border-stone-200">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-semibold">
                    <th className="p-3 border border-stone-200">Waist Size</th>
                    <th className="p-3 border border-stone-200">Length (Inseam)</th>
                    <th className="p-3 border border-stone-200">Thigh</th>
                    <th className="p-3 border border-stone-200">Bottom Leg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">30</td>
                    <td className="p-3 border border-stone-200">30" - 31"</td>
                    <td className="p-3 border border-stone-200">22"</td>
                    <td className="p-3 border border-stone-200">13"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">32</td>
                    <td className="p-3 border border-stone-200">31" - 32"</td>
                    <td className="p-3 border border-stone-200">23"</td>
                    <td className="p-3 border border-stone-200">13.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">34</td>
                    <td className="p-3 border border-stone-200">32"</td>
                    <td className="p-3 border border-stone-200">24"</td>
                    <td className="p-3 border border-stone-200">14"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">36</td>
                    <td className="p-3 border border-stone-200">32"</td>
                    <td className="p-3 border border-stone-200">25"</td>
                    <td className="p-3 border border-stone-200">14.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold border border-stone-200 bg-stone-50">38</td>
                    <td className="p-3 border border-stone-200">32"</td>
                    <td className="p-3 border border-stone-200">26"</td>
                    <td className="p-3 border border-stone-200">15"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Measuring Tips */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">💡 How to Measure:</span> Measure around the fullest part of your chest/bust keeping the tape horizontal. For length, measure from the highest point of the shoulder down to the desired hemline. Need help with sizing? Contact our stylists on WhatsApp!
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition"
          >
            {language === 'bn' ? 'ঠিক আছে' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
